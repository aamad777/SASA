#!/bin/bash
# SASA_CHILD_CREATE_V22 — child-profile creation contract, run against a live
# deployment. Covers the case that was actually broken in production: the
# create form advertised "minimum 4 digits" and accepted up to ten, while the
# API requires exactly four, so a parent who typed a longer PIN was rejected
# and could not create the child at all.
#
#   bash tests/child-create-contract.sh [API_BASE]
#
# Creates throwaway accounts under @example.invalid and deletes the children it
# makes. No PIN, hash or token is ever printed.
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

STAMP=$(date +%s)
EMAIL="sasa-createtest-${STAMP}@example.invalid"
PWD_="$(head -c 18 /dev/urandom | base64 | tr -d '/+=')Aa1!"
curl -s -m 30 -X POST -H "Content-Type: application/json" \
  -d "$(J displayName 'Create Test' email "$EMAIL" password "$PWD_")" "$API/auth/register" >/dev/null
TOKEN=$(curl -s -m 30 -X POST -H "Content-Type: application/json" \
  -d "$(J email "$EMAIL" password "$PWD_")" "$API/auth/login" | field token)
AUTH="Authorization: Bearer ${TOKEN}"
[ -n "$TOKEN" ] && ok "parent can authenticate" || no "parent auth" "no token"

create(){ curl -s -m 30 -o /tmp/cc.json -w "%{http_code}" -X POST -H "Content-Type: application/json" -H "$AUTH" -d "$1" "$API/parent/children"; }

# 1 required field
S=$(create '{"age":6}')
[ "$S" = "400" ] && ok "missing displayName is rejected (400)" || no "missing name" "got $S"

# 2 the regression: a PIN longer than four digits
S=$(create "{\"displayName\":\"Long Pin\",\"childLoginId\":\"long-pin-$STAMP\",\"pin\":\"123456\"}")
[ "$S" = "400" ] && ok "6-digit PIN is rejected by the API (400) - the UI must not offer it" || no "long pin" "got $S"

# 3 invalid PIN characters
S=$(create "{\"displayName\":\"Bad Pin\",\"childLoginId\":\"bad-pin-$STAMP\",\"pin\":\"12ab\"}")
[ "$S" = "400" ] && ok "non-numeric PIN is rejected (400)" || no "bad pin" "got $S"

# 4 happy path with a PIN
S=$(create "{\"displayName\":\"Pin Kid\",\"childLoginId\":\"pin-kid-$STAMP\",\"age\":7,\"pin\":\"1234\",\"avatarUrl\":\"emoji:🦊\"}")
KID_PIN_ID=$(field child.id < /tmp/cc.json)
[ "$S" = "201" ] && [ -n "$KID_PIN_ID" ] && ok "child with a 4-digit PIN is created (201)" || no "create with pin" "got $S"

# 5 happy path without a PIN - optional fields must not block submission
S=$(create "{\"displayName\":\"No Pin Kid\",\"childLoginId\":\"nopin-kid-$STAMP\"}")
KID_NOPIN_ID=$(field child.id < /tmp/cc.json)
[ "$S" = "201" ] && ok "child without a PIN is created (201)" || no "create without pin" "got $S"

# 6 chosen avatar is persisted
AV=$(curl -s -m 30 -H "$AUTH" "$API/parent/children" | python3 -c "
import json,sys
for c in json.load(sys.stdin)['children']:
    if c['display_name']=='Pin Kid': print(c.get('avatar_url') or '')")
[ "$AV" = "emoji:🦊" ] && ok "chosen avatar is stored and returned" || no "avatar" "got '$AV'"

# 7 duplicate login id
S=$(create "{\"displayName\":\"Dup\",\"childLoginId\":\"pin-kid-$STAMP\"}")
[ "$S" = "409" ] && ok "duplicate login id is refused with 409, not a 500" || no "duplicate" "got $S"

# 8 has_pin reflects reality, and no hash is ever returned
BODY=$(curl -s -m 30 -H "$AUTH" "$API/parent/children")
echo "$BODY" | python3 -c "
import json,sys
m={c['display_name']:c.get('has_pin') for c in json.load(sys.stdin)['children']}
sys.exit(0 if m.get('Pin Kid') is True and m.get('No Pin Kid') is False else 1)" \
  && ok "has_pin is true/false to match how each child was created" || no "has_pin" "wrong"
echo "$BODY" | grep -qiE '"(pin_hash|password_hash|pin)"' \
  && no "no secrets in the children list" "hash present" \
  || ok "children list never returns pin_hash / password_hash / pin"

# 9 ownership - a second parent must not see or touch the first parent's child
E2="sasa-createtest2-${STAMP}@example.invalid"
P2="$(head -c 18 /dev/urandom | base64 | tr -d '/+=')Aa1!"
curl -s -m 30 -X POST -H "Content-Type: application/json" \
  -d "$(J displayName 'Other' email "$E2" password "$P2")" "$API/auth/register" >/dev/null
T2=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$E2" password "$P2")" "$API/auth/login" | field token)
N=$(curl -s -m 30 -H "Authorization: Bearer $T2" "$API/parent/children" | python3 -c "
import json,sys; print(len(json.load(sys.stdin).get('children',[])))")
[ "$N" = "0" ] && ok "a parent sees only their own children" || no "isolation" "saw $N"
S=$(curl -s -o /dev/null -w "%{http_code}" -m 30 -X DELETE -H "Authorization: Bearer $T2" "$API/parent/children/$KID_PIN_ID")
[ "$S" = "404" ] || [ "$S" = "403" ] && ok "another parent cannot delete this child ($S)" || no "cross-delete" "got $S"

# 10 expired / absent session
S=$(curl -s -o /dev/null -w "%{http_code}" -m 30 -X POST -H "Content-Type: application/json" \
  -d '{"displayName":"No Auth"}' "$API/parent/children")
[ "$S" = "401" ] && ok "creating without a session is refused (401)" || no "unauth create" "got $S"

# 11 the created child survives a re-read (it is really in the database)
N=$(curl -s -m 30 -H "$AUTH" "$API/parent/children" | python3 -c "
import json,sys; print(len(json.load(sys.stdin).get('children',[])))")
[ "$N" = "2" ] && ok "both created children persist on re-read" || no "persistence" "saw $N"

echo
echo "  ---- $PASS passed, $FAIL failed ----"
for ID in "$KID_PIN_ID" "$KID_NOPIN_ID"; do
  [ -n "$ID" ] && curl -s -o /dev/null -m 30 -X DELETE -H "$AUTH" "$API/parent/children/$ID"
done
[ "$FAIL" -eq 0 ]
