#!/usr/bin/env bash
# Claude Code status line: shows current model and context window usage

input=$(cat)

model=$(echo "$input" | jq -r '.model.display_name // .model.id // "unknown"')
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
remaining_pct=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty')
used_tokens=$(echo "$input" | jq -r '.context_window.current_usage.input_tokens // empty')
window_size=$(echo "$input" | jq -r '.context_window.context_window_size // empty')

# Build context info string
if [ -n "$used_pct" ]; then
  ctx_info=$(printf "%.0f%% used" "$used_pct")
  if [ -n "$remaining_pct" ]; then
    ctx_info=$(printf "%.0f%% used / %.0f%% free" "$used_pct" "$remaining_pct")
  fi
elif [ -n "$used_tokens" ] && [ -n "$window_size" ]; then
  ctx_info="${used_tokens}/${window_size} tokens"
else
  ctx_info="no data yet"
fi

printf "\033[1;36m%s\033[0m  |  ctx: \033[1;33m%s\033[0m" "$model" "$ctx_info"
