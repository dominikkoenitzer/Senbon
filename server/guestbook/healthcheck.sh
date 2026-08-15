#!/usr/bin/env bash
# Records when the Senbon guestbook API stops being reachable *through Caddy*.
#
# This is a flight recorder, not an alarm. It pushes no notification anywhere —
# this host has no mail or webhook setup, and inventing one for a personal
# guestbook is not worth the surface. What it buys is that "when did it break?"
# has an answer in one command instead of an archaeology session through
# container logs.
#
# Context worth keeping: on 2026-08-08 caddy-proxy was recreated without an
# attachment to senbon_net. Name resolution for senbon-guestbook-api failed
# inside Caddy, every request 502'd, and it went unnoticed for seven days
# because /guestbook still answered 200 with an empty wall. So on failure this
# also records Caddy's current network list — that single line is usually the
# whole diagnosis.
#
# Deliberately checks the public URL rather than the container directly: that is
# the path Vercel actually uses, so it exercises DNS, TLS, Caddy and the API
# together. A container-level check would have stayed green through that outage.
#
# Installed at /opt/scripts/senbon-guestbook-health.sh, run every 5 minutes by
# /etc/cron.d/senbon-guestbook-health, which appends stdout to
# /var/log/senbon-guestbook-health.log.

# No `set -e`: a non-200 is the case this script exists to handle, not a reason
# to abort before it has been written down.
set -uo pipefail

# Overridable so the failure branch can be exercised on demand without waiting
# for a real outage: URL=https://example.invalid /opt/scripts/senbon-guestbook-health.sh
URL=${URL:-https://api.senbon.ch/health}

# Only failures are written. A healthy guestbook should produce an empty log,
# so anything in the file at all is a finding, and the first line of a run is
# the moment it broke.
STATUS=$(curl -sS -o /dev/null -m 15 -w '%{http_code}' "$URL" 2>/dev/null || echo 000)

if [ "$STATUS" != "200" ]; then
  NETS=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' caddy-proxy 2>/dev/null || echo '<inspect failed>')
  echo "$(date -Is) FAIL http=$STATUS caddy-networks: $NETS"
fi
