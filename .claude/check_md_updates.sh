#!/usr/bin/env bash
# check_md_updates.sh
# Tracks modification timestamps of key markdown files across a Claude Code session.
# Usage:
#   check_md_updates.sh --save-baseline   (call from SessionStart hook)
#   check_md_updates.sh --check           (call from SessionEnd hook)

PROJ_DIR="/Users/Aaditya/Desktop/CMS Change Request Tool/cms-change-requests-demo"
FILES=(
  "$PROJ_DIR/README.md"
  "$PROJ_DIR/SPEC.md"
  "$PROJ_DIR/CLAUDE.md"
  "$PROJ_DIR/CHANGELOG.md"
)
BASELINE="/tmp/cms_crt_md_baseline.txt"

get_ts() {
  if [[ -f "$1" ]]; then
    stat -f %m "$1"
  else
    echo "0"
  fi
}

case "${1:-}" in
  --save-baseline)
    : > "$BASELINE"
    for f in "${FILES[@]}"; do
      echo "$(get_ts "$f") $f" >> "$BASELINE"
    done
    ;;

  --check)
    [[ ! -f "$BASELINE" ]] && exit 0

    changed=()
    for f in "${FILES[@]}"; do
      current_ts=$(get_ts "$f")
      baseline_ts=$(grep -F "$f" "$BASELINE" 2>/dev/null | awk '{print $1}')
      [[ -z "$baseline_ts" ]] && baseline_ts="0"
      if [[ "$current_ts" != "$baseline_ts" ]]; then
        changed+=("$f")
      fi
    done

    if [[ ${#changed[@]} -gt 0 ]]; then
      names=""
      for f in "${changed[@]}"; do
        names="${names}$(basename "$f"), "
      done
      names="${names%, }"  # strip trailing ", "
      osascript -e "display dialog \"Claude.ai Project update needed\n\nModified this session:\n${names}\n\nPlease re-upload them to your Claude.ai Project.\" with title \"CMS Change Request Tracker\" buttons {\"OK\"} default button \"OK\" with icon caution" &>/dev/null
    fi
    ;;
esac
