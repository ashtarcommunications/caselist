# Restoring Deleted Teams and Rounds

At some point I will get around to implementing a UI or at least a script for restoring deleted items from the version history, but for now, here are the SQL commands to restore a deleted team and its rounds.

Depending on the circumstances, consider adding some time constraints to these queries to only restore things deleted in a particular time frame or by a particular user, as is they will restore all deleted items for a team, including things that may have been deleted on purpose.

Make sure to update the ID's in the following queries to match the team you are restoring.

```sql
INSERT INTO teams (team_id, school_id, name, display_name, notes, debater1_first, debater1_last, debater2_first, debater2_last, created_by_id) SELECT team_id, school_id, name, display_name, notes, debater1_first, debater1_last, debater2_first, debater2_last, <id_of_last_legitimate_user> FROM teams_history where team_id = <team_id> and version = 8;

INSERT INTO rounds (round_id, team_id, side, tournament, round, opponent, judge, report, opensource, video, tourn_id, created_by_id) SELECT round_id, team_id, side, tournament, round, opponent, judge, report, opensource, video, tourn_id, created_by_id FROM rounds_history WHERE team_id = <team_id> AND event = 'delete';

INSERT INTO cites (cite_id, round_id, title, cites, created_by_id) SELECT cite_id, round_id, title, cites, created_by_id FROM cites_history WHERE round_id IN (SELECT DISTINCT round_id FROM rounds_history where team_id = <team_id> and event = 'delete') AND event = 'delete';
```

You also have to restore deleted files on the file system. The following script will rename all files in the current directory that end with `-DELETED-vX.pdf` to remove the `-DELETED-vX` part of the filename.

Note that you may need to do some manual adjustments for files with multiple deleted versions, since the target filename will be the same.

```sh

for file in *.docx; do
  # Generate the new file name by removing "-DELETED-vX.pdf"
  new_name=$(echo "$file" | sed -E 's/-DELETED-v[0-9]+\.docx$/.docx/')

  # Only copy if the new name is different from the original
  if [[ "$file" != "$new_name" ]]; then
    echo "Copying $file to $new_name"
    cp "$file" "$new_name"
  fi
done
```