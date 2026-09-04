#!/bin/bash
# SASA_CHILD_MEDIA_AUTH_V25 — authorization for GET /api/child/:profileId/media.
#
# Before this, the endpoint took a profile uuid from the URL with no session at
# all: knowing or guessing an id returned that child's whole assigned library.
#
#   bash tests/child-media-authorization.sh [API_BASE]
API="${1:-https://sara.khader-ai.online/api}"
PASS=0; FAIL=0
ok(){ echo "  PASS  $1"; PASS=$((PASS+1)); }
no(){ echo "  FAIL  $1  -- $2"; FAIL=$((FAIL+1)); }
J(){ python3 -c "import json,sys;print(json.dumps(dict(zip(sys.argv[1::2],sys.argv[2::2]))))" "$@"; }
field(){ python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: print(''); raise SystemExit
cur=d
for k in sys.argv[1].split('.'):
    cur = cur.get(k) if isinstance(cur,dict) else None
print(cur if cur is not None else '')" "$1"; }
code(){ curl -s -o /tmp/cm.json -w "%{http_code}" -m 30 "$@"; }
mkpw(){ echo "$(head -c 18 /dev/urandom | base64 | tr -d '/+=')Aa1!"; }
STAMP=$(date +%s)

# Family A: parent + child with a PIN (so the child can obtain a session).
AE="sasa-cma-a-${STAMP}@example.invalid"; AP=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J displayName 'Fam A' email "$AE" password "$AP")" "$API/auth/register" >/dev/null
ATOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$AE" password "$AP")" "$API/auth/login" | field token)
ALOGIN="cma-a-$STAMP"
ACHILD=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ATOK" \
  -d "{\"displayName\":\"Kid A\",\"childLoginId\":\"$ALOGIN\",\"pin\":\"1234\"}" "$API/parent/children" | field child.id)

# Family B: unrelated parent + child.
BE="sasa-cma-b-${STAMP}@example.invalid"; BP=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J displayName 'Fam B' email "$BE" password "$BP")" "$API/auth/register" >/dev/null
BTOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$BE" password "$BP")" "$API/auth/login" | field token)
BLOGIN="cma-b-$STAMP"
BCHILD=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $BTOK" \
  -d "{\"displayName\":\"Kid B\",\"childLoginId\":\"$BLOGIN\",\"pin\":\"4321\"}" "$API/parent/children" | field child.id)

# Child sessions.
ACTOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J childLoginId "$ALOGIN" pin 1234)" "$API/child/login" | field token)
BCTOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J childLoginId "$BLOGIN" pin 4321)" "$API/child/login" | field token)
[ -n "$ACTOK" ] && ok "child login issues a child-scoped session token" || no "child token" "none issued"

# Admin, granted server-side.
DE="sasa-cma-admin-${STAMP}@example.invalid"; DP=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J displayName 'CMA Admin' email "$DE" password "$DP")" "$API/auth/register" >/dev/null
kubectl exec -n saratube pod/saratube-postgres-74cffd5dc5-8rc49 -- \
  psql -U saratube -d saratube -q -c "UPDATE users SET role='admin' WHERE email='$DE'" >/dev/null 2>&1
DTOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$DE" password "$DP")" "$API/auth/login" | field token)

# Give child A one assigned item so a success is distinguishable from an empty list.
curl -s -o /dev/null -m 90 -X POST -H "Authorization: Bearer $ATOK" \
  -F "file=@${TESTIMG:-/tmp/sasa-test.png};type=image/png" -F "title=CMA Family Photo" \
  -F "childProfileIds=[\"$ACHILD\"]" "$API/media/upload"

echo
S=$(code "$API/child/$ACHILD/media")
[ "$S" = "401" ] && ok "unauthenticated request is rejected (401)" || no "guest" "got $S"

S=$(code -H "Authorization: Bearer $ACTOK" "$API/child/$ACHILD/media")
N=$(python3 -c "import json;print(len(json.load(open('/tmp/cm.json')).get('media',[])))" 2>/dev/null)
[ "$S" = "200" ] && [ "$N" -ge 1 ] && ok "the child themselves can read their own media (200, $N items)" || no "own child" "got $S/$N"

S=$(code -H "Authorization: Bearer $BCTOK" "$API/child/$ACHILD/media")
[ "$S" = "404" ] && ok "a different child cannot read it (404)" || no "other child" "got $S"

S=$(code -H "Authorization: Bearer $ATOK" "$API/child/$ACHILD/media")
[ "$S" = "200" ] && ok "the owning parent can read it (200)" || no "owning parent" "got $S"

S=$(code -H "Authorization: Bearer $BTOK" "$API/child/$ACHILD/media")
[ "$S" = "404" ] && ok "an unrelated parent cannot read it (404)" || no "unrelated parent" "got $S"

S=$(code -H "Authorization: Bearer $DTOK" "$API/child/$ACHILD/media")
[ "$S" = "200" ] && ok "an administrator can read it (200)" || no "admin" "got $S"

# Indistinguishability: unauthorised real id vs a well-formed id that does not exist.
FAKE="00000000-0000-4000-8000-000000000000"
R1=$(curl -s -o /tmp/r1.json -w "%{http_code}" -m 30 -H "Authorization: Bearer $BTOK" "$API/child/$ACHILD/media")
R2=$(curl -s -o /tmp/r2.json -w "%{http_code}" -m 30 -H "Authorization: Bearer $BTOK" "$API/child/$FAKE/media")
if [ "$R1" = "$R2" ] && [ "$(cat /tmp/r1.json)" = "$(cat /tmp/r2.json)" ]; then
  ok "an unauthorised real profile is indistinguishable from a nonexistent one ($R1, identical body)"
else
  no "indistinguishable" "$R1 vs $R2"
fi

# A malformed id must not leak a different error either.
R3=$(curl -s -o /tmp/r3.json -w "%{http_code}" -m 30 -H "Authorization: Bearer $BTOK" "$API/child/not-a-uuid/media")
[ "$R3" = "$R2" ] && ok "a malformed profile id answers the same way (no 500 leak)" || no "malformed id" "got $R3"

# The child session must not be parent-capable.
S=$(code -H "Authorization: Bearer $ACTOK" "$API/parent/children")
[ "$S" = "403" ] && ok "a child session cannot call parent endpoints (403)" || no "child->parent" "got $S"
S=$(code -H "Authorization: Bearer $ACTOK" "$API/admin/overview")
[ "$S" = "403" ] && ok "a child session cannot call admin endpoints (403)" || no "child->admin" "got $S"

# No secrets in the payload.
code -H "Authorization: Bearer $ATOK" "$API/child/$ACHILD/media" >/dev/null
grep -qiE '"(password_hash|pin_hash|pin|owner_user_id|file_path)"' /tmp/cm.json \
  && no "response exposes no secrets or private owner details" "sensitive field present" \
  || ok "response exposes no password, PIN hash, owner id or filesystem path"

echo
echo "  ---- $PASS passed, $FAIL failed ----"
for C in "$ACHILD"; do [ -n "$C" ] && curl -s -o /dev/null -m 30 -X DELETE -H "Authorization: Bearer $ATOK" "$API/parent/children/$C"; done
[ -n "$BCHILD" ] && curl -s -o /dev/null -m 30 -X DELETE -H "Authorization: Bearer $BTOK" "$API/parent/children/$BCHILD"
[ "$FAIL" -eq 0 ]
