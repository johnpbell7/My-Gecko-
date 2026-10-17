#!/usr/bin/env bash
# Every check, in the order that fails fastest. Each one drives a real browser
# against index.html, so they are slow - a full pass takes about an hour on a
# modest machine. Pass names to run only those:  ./run.sh tdz verify
set -u
cd "$(dirname "$0")"
SUITE="tdz verify tour says players solid twogames sweep scenarios cave jam ride
       toys custom box room turn watch levels water play outdoor"
[ $# -gt 0 ] && SUITE="$*"
fail=0
for t in $SUITE; do
  [ -f "$t.js" ] || { echo "no such check: $t"; continue; }
  echo "=========== $t"
  out=$(node "$t.js" 2>&1)
  echo "$out" | tail -14
  echo "$out" | grep -q '\*\*\*' && { fail=$((fail+1)); echo "   ^ $t flagged something"; }
done
echo
[ $fail -eq 0 ] && echo "all clear" || echo "*** $fail check(s) flagged something ***"
exit $fail
