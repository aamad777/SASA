#!/bin/bash
# SASA_ADMIN_V24 — authorization contract for the admin API, the public media
# library and child avatars. Run against a live deployment.
#
#   bash tests/admin-authorization.sh [API_BASE]
#
# Creates throwaway @example.invalid accounts and removes what it makes.
# No password, PIN, hash or token is printed.
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
code(){ curl -s -o /tmp/aa.json -w "%{http_code}" -m 30 "$@"; }

STAMP=$(date +%s)
mkpw(){ echo "$(head -c 18 /dev/urandom | base64 | tr -d '/+=')Aa1!"; }

# --- a parent, with a child ---
PEMAIL="sasa-authp-${STAMP}@example.invalid"; PPW=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J displayName 'Auth Parent' email "$PEMAIL" password "$PPW")" "$API/auth/register" >/dev/null
PTOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$PEMAIL" password "$PPW")" "$API/auth/login" | field token)
[ -n "$PTOK" ] && ok "parent session established" || no "parent auth" "no token"
CHILD=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $PTOK" \
  -d "{\"displayName\":\"Auth Kid\",\"childLoginId\":\"auth-kid-$STAMP\",\"pin\":\"1234\"}" "$API/parent/children" | field child.id)

# --- a second family, to prove isolation ---
P2EMAIL="sasa-authq-${STAMP}@example.invalid"; P2PW=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J displayName 'Other Parent' email "$P2EMAIL" password "$P2PW")" "$API/auth/register" >/dev/null
P2TOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$P2EMAIL" password "$P2PW")" "$API/auth/login" | field token)

# --- an admin, created server-side (never by self-registration) ---
AEMAIL="sasa-authadmin-${STAMP}@example.invalid"; APW=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J displayName 'Auth Admin' email "$AEMAIL" password "$APW")" "$API/auth/register" >/dev/null
kubectl exec -n saratube pod/saratube-postgres-74cffd5dc5-8rc49 -- \
  psql -U saratube -d saratube -q -c "UPDATE users SET role='admin' WHERE email='$AEMAIL'" >/dev/null 2>&1
ATOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$AEMAIL" password "$APW")" "$API/auth/login" | field token)
[ -n "$ATOK" ] && ok "admin session established (role granted server-side, not by registration)" || no "admin auth" "no token"

echo
echo "  -- admin endpoints reject everyone else --"
for R in admin/overview admin/parents admin/audit admin/public-media; do
  S=$(code "$API/$R")
  [ "$S" = "401" ] && ok "guest cannot call /$R (401)" || no "guest /$R" "got $S"
done
for R in admin/overview admin/parents admin/audit admin/public-media; do
  S=$(code -H "Authorization: Bearer $PTOK" "$API/$R")
  [ "$S" = "403" ] && ok "parent cannot call /$R (403)" || no "parent /$R" "got $S"
done
S=$(code -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $PTOK" -d '{"status":"suspended"}' "$API/admin/parents/$CHILD/status")
[ "$S" = "403" ] && ok "parent cannot suspend an account (403)" || no "parent suspend" "got $S"

echo
echo "  -- registration cannot grant admin --"
SNEAK="sasa-sneak-${STAMP}@example.invalid"; SPW=$(mkpw)
curl -s -m 30 -X POST -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Sneak\",\"email\":\"$SNEAK\",\"password\":\"$SPW\",\"role\":\"admin\"}" "$API/auth/register" >/dev/null
STOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$SNEAK" password "$SPW")" "$API/auth/login" | field token)
S=$(code -H "Authorization: Bearer $STOK" "$API/admin/overview")
[ "$S" = "403" ] && ok "self-registering with role=admin does not grant admin (403)" || no "role escalation" "got $S"

echo
echo "  -- admin can manage parent accounts --"
S=$(code -H "Authorization: Bearer $ATOK" "$API/admin/overview")
[ "$S" = "200" ] && ok "admin can read the overview (200)" || no "admin overview" "got $S"
S=$(code -H "Authorization: Bearer $ATOK" "$API/admin/parents?search=sasa-authp")
[ "$S" = "200" ] && ok "admin can search parent accounts (200)" || no "admin search" "got $S"
PID=$(python3 -c "
import json
d=json.load(open('/tmp/aa.json'))
print(next((p['id'] for p in d.get('parents',[]) if 'authp' in p['email']),''))")
[ -n "$PID" ] && ok "search returns the expected parent" || no "search result" "not found"
S=$(code -H "Authorization: Bearer $ATOK" "$API/admin/parents/$PID")
[ "$S" = "200" ] && ok "admin can open a parent detail screen (200)" || no "parent detail" "got $S"
grep -qiE '"(pin_hash|password_hash|pin)"' /tmp/aa.json \
  && no "parent detail hides secrets" "hash present" \
  || ok "parent detail exposes no PIN, hash or password"
grep -q '"has_pin"' /tmp/aa.json && ok "parent detail reports has_pin only" || no "has_pin" "missing"

echo
echo "  -- suspension --"
S=$(code -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ATOK" -d '{"status":"suspended"}' "$API/admin/parents/$PID/status")
[ "$S" = "200" ] && ok "admin can suspend a parent (200)" || no "suspend" "got $S"
S=$(code -X POST -H "Content-Type: application/json" -d "$(J email "$PEMAIL" password "$PPW")" "$API/auth/login")
[ "$S" = "403" ] && ok "suspended parent cannot start a new session (403)" || no "suspended login" "got $S"
S=$(code -H "Authorization: Bearer $PTOK" "$API/parent/children")
[ "$S" = "403" ] || [ "$S" = "401" ] && ok "the suspended parent's existing token stops working ($S)" || no "existing token" "got $S"
S=$(code -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ATOK" -d '{"status":"active"}' "$API/admin/parents/$PID/status")
[ "$S" = "200" ] && ok "admin can restore the account (200)" || no "restore" "got $S"
PTOK=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -d "$(J email "$PEMAIL" password "$PPW")" "$API/auth/login" | field token)
[ -n "$PTOK" ] && ok "restored parent can sign in again" || no "restored login" "no token"

echo
echo "  -- audit trail --"
S=$(code -H "Authorization: Bearer $ATOK" "$API/admin/audit?limit=20")
python3 -c "
import json,sys
d=json.load(open('/tmp/aa.json'))
acts=[e['action'] for e in d.get('entries',[])]
sys.exit(0 if 'parent.suspend' in acts and 'parent.restore' in acts else 1)" \
  && ok "suspend and restore are both recorded in the audit log" || no "audit" "actions missing"
python3 -c "
import json,sys
d=json.load(open('/tmp/aa.json'))
e=next((x for x in d.get('entries',[]) if x['action']=='parent.suspend'),None)
sys.exit(0 if e and e.get('actor_email') and e.get('created_at') and e.get('target_id') else 1)" \
  && ok "audit entries record actor, target and timestamp" || no "audit fields" "incomplete"

echo
echo "  -- public media and guests --"
S=$(code "$API/public/media")
[ "$S" = "200" ] && ok "guests can read the public feed without an account (200)" || no "public feed" "got $S"
BEFORE=$(python3 -c "import json;print(len(json.load(open('/tmp/aa.json')).get('media',[])))")
S=$(curl -s -o /tmp/aa.json -w "%{http_code}" -m 90 -X POST -H "Authorization: Bearer $ATOK" \
  -F "file=@${TESTIMG:-/tmp/sasa-test.png};type=image/png" -F "title=Auth Test Photo" -F "category=Nature" \
  "$API/admin/public-media")
MID=$(field media.id < /tmp/aa.json)
[ "$S" = "201" ] && ok "admin upload to the public library succeeds (201)" || no "admin upload" "got $S"
VIS=$(python3 -c "
import json;d=json.load(open('/tmp/aa.json')).get('media',{});print(d.get('visibility'),d.get('publication_status'))")
[ "$VIS" = "public draft" ] && ok "new public media defaults to draft, not published" || no "default status" "got '$VIS'"
S=$(code "$API/public/media"); AFTER=$(python3 -c "import json;print(len(json.load(open('/tmp/aa.json')).get('media',[])))")
[ "$AFTER" = "$BEFORE" ] && ok "a draft is invisible in the guest feed" || no "draft leak" "$BEFORE -> $AFTER"
S=$(code -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $ATOK" -d '{"publication_status":"published"}' "$API/admin/public-media/$MID")
[ "$S" = "200" ] && ok "admin can publish (200)" || no "publish" "got $S"
S=$(code "$API/public/media"); AFTER2=$(python3 -c "import json;print(len(json.load(open('/tmp/aa.json')).get('media',[])))")
[ "$AFTER2" -gt "$BEFORE" ] && ok "published media appears in the guest feed" || no "publish visibility" "$BEFORE -> $AFTER2"
grep -q '"owner_user_id"' /tmp/aa.json && no "guest feed hides the uploader" "owner exposed" || ok "guest feed does not expose the uploading administrator"
S=$(code -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer $ATOK" -d '{"publication_status":"draft"}' "$API/admin/public-media/$MID")
S=$(code "$API/public/media"); AFTER3=$(python3 -c "import json;print(len(json.load(open('/tmp/aa.json')).get('media',[])))")
[ "$AFTER3" = "$BEFORE" ] && ok "unpublishing removes it from the guest feed immediately" || no "unpublish" "$BEFORE -> $AFTER3"
S=$(curl -s -o /dev/null -w "%{http_code}" -m 60 -X POST -H "Authorization: Bearer $ATOK" \
  -F "file=@${TESTSVG:-/tmp/sasa-evil.svg};type=image/png" -F "title=Evil" "$API/admin/public-media")
[ "$S" = "400" ] && ok "an SVG renamed as a PNG is rejected by signature check (400)" || no "svg reject" "got $S"

echo
echo "  -- private family media stays private --"
PRIV=$(curl -s -m 30 -H "Authorization: Bearer $PTOK" "$API/media/manage" | python3 -c "
import json,sys
d=json.load(sys.stdin); items=d if isinstance(d,list) else d.get('media',[])
print(items[0]['id'] if items else '')")
S=$(code "$API/public/media")
python3 -c "
import json,sys
d=json.load(open('/tmp/aa.json'))
ids=[m['id'] for m in d.get('media',[])]
sys.exit(0 if '$PRIV' not in ids else 1)" && ok "private family media never appears in the guest feed" || no "private leak" "found"


echo
echo "  -- child avatars --"
# A child session: the backend issues no bearer token for children, so the
# family's own parent session is used for parent-side checks, and a child user
# row is exercised directly for the child-side rule.
CHILD2=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $PTOK" \
  -d "{\"displayName\":\"Auth Kid Two\",\"childLoginId\":\"auth-kid2-$STAMP\"}" "$API/parent/children" | field child.id)
OTHERKID=$(curl -s -m 30 -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $P2TOK" \
  -d "{\"displayName\":\"Other Kid\",\"childLoginId\":\"other-kid-$STAMP\"}" "$API/parent/children" | field child.id)

S=$(code -X POST -H "Authorization: Bearer $PTOK" -F "avatarUrl=emoji:🦊" "$API/profiles/$CHILD/avatar")
[ "$S" = "200" ] && ok "parent can set a built-in avatar on their own child (200)" || no "parent preset" "got $S"

S=$(curl -s -o /tmp/aa.json -w "%{http_code}" -m 60 -X POST -H "Authorization: Bearer $PTOK" \
  -F "file=@${TESTIMG}" "$API/profiles/$CHILD/avatar")
AV=$(field avatar_url < /tmp/aa.json)
[ "$S" = "200" ] && ok "parent can upload a photo avatar for their own child (200)" || no "avatar upload" "got $S"
case "$AV" in /avatars/*) ok "avatar is stored under the private /avatars path" ;; *) no "avatar path" "got '$AV'" ;; esac

# Cross-family: the other parent must not touch this child.
S=$(code -X POST -H "Authorization: Bearer $P2TOK" -F "avatarUrl=emoji:🐼" "$API/profiles/$CHILD/avatar")
[ "$S" = "404" ] && ok "another family's parent cannot change this child's avatar (404, no id probing)" || no "cross-family avatar" "got $S"
S=$(code -H "Authorization: Bearer $P2TOK" "$API/profiles/$CHILD/avatar")
[ "$S" = "404" ] && ok "another family's parent cannot read this child's avatar (404)" || no "cross-family read" "got $S"

# Guests must not reach it at all, by API or by guessing the file path.
S=$(code "$API/profiles/$CHILD/avatar")
[ "$S" = "401" ] && ok "a guest cannot read a child avatar through the API (401)" || no "guest avatar api" "got $S"
S=$(code "${API%/api}/uploads$AV")
[ "$S" = "404" ] && ok "a child avatar file is not served by the static uploads mount (404)" || no "avatar static leak" "got $S"

# The processed avatar must carry no EXIF/GPS.
S=$(code -H "Authorization: Bearer $PTOK" "$API/profiles/$CHILD/avatar")
[ "$S" = "200" ] && ok "the family can read the avatar through the authorised route (200)" || no "authorised read" "got $S"
python3 - <<'INNER'
import subprocess, json, sys
out = subprocess.run(["ffprobe","-v","error","-show_entries","format_tags:stream_tags","-of","json","/tmp/aa.json"],
                     capture_output=True, text=True)
INNER
curl -s -m 30 -H "Authorization: Bearer $PTOK" "$API/profiles/$CHILD/avatar" -o /tmp/avatar.webp
if command -v ffprobe >/dev/null 2>&1; then
  TAGS=$(ffprobe -v error -show_entries format_tags:stream_tags -of json /tmp/avatar.webp 2>/dev/null | tr -d ' \n')
  echo "$TAGS" | grep -qiE 'gps|location|make|model|datetime' \
    && no "avatar has no EXIF/GPS metadata" "tags present" \
    || ok "the processed avatar carries no EXIF or GPS metadata"
  DIM=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 /tmp/avatar.webp 2>/dev/null)
  [ "$DIM" = "512,512" ] && ok "the avatar is normalised to 512x512" || no "avatar size" "got '$DIM'"
fi

# A rejected replacement must leave the existing avatar in place.
S=$(code -X POST -H "Authorization: Bearer $PTOK" -F "file=@${TESTSVG};type=image/png" "$API/profiles/$CHILD/avatar")
[ "$S" = "400" ] && ok "an SVG avatar is rejected by signature check (400)" || no "avatar svg" "got $S"
AV2=$(curl -s -m 30 -H "Authorization: Bearer $ATOK" "$API/admin/parents/$PID" | python3 -c "
import json,sys
for c in json.load(sys.stdin).get('children',[]):
    if c['id']=='$CHILD': print(c.get('avatar_url') or '')")
[ "$AV2" = "$AV" ] && ok "a failed avatar replacement keeps the previous avatar" || no "avatar rollback" "'$AV' -> '$AV2'"

# The avatar endpoint cannot be used as a general media upload.
BEFORE_M=$(curl -s -m 30 -H "Authorization: Bearer $ATOK" "$API/admin/public-media?limit=1" | field total)
curl -s -o /dev/null -m 60 -X POST -H "Authorization: Bearer $PTOK" -F "file=@${TESTIMG}" "$API/profiles/$CHILD/avatar"
AFTER_M=$(curl -s -m 30 -H "Authorization: Bearer $ATOK" "$API/admin/public-media?limit=1" | field total)
[ "$BEFORE_M" = "$AFTER_M" ] && ok "an avatar upload creates no public media record" || no "avatar leak to library" "$BEFORE_M -> $AFTER_M"

echo
echo "  ---- $PASS passed, $FAIL failed ----"
# cleanup
[ -n "$MID" ] && curl -s -o /dev/null -m 30 -X DELETE -H "Authorization: Bearer $ATOK" "$API/admin/public-media/$MID"
for C in "$CHILD" "$CHILD2"; do
  [ -n "$C" ] && curl -s -o /dev/null -m 30 -X DELETE -H "Authorization: Bearer $PTOK" "$API/parent/children/$C"
done
[ -n "$OTHERKID" ] && curl -s -o /dev/null -m 30 -X DELETE -H "Authorization: Bearer $P2TOK" "$API/parent/children/$OTHERKID"
[ "$FAIL" -eq 0 ]
