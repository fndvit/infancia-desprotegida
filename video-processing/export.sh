IN="raw"
OUT="../../app/public/video"

cd $IN
for FILE in *.mp4
do
    echo "processing $FILE"
    FILE_NO_UNDERSCORE="${FILE//_/}"
    FILE_NO_SPACES="${FILE_NO_UNDERSCORE// /_}"
    FILE_NO_EXTENSION="${FILE_NO_SPACES%.*}"
    FILE_NO_DOTS="${FILE_NO_EXTENSION//./}"
    FILE_NO_SLASHES="${FILE_NO_DOTS//\//_}"
    FILE_NO_COLON="${FILE_NO_SLASHES//:/_}"
    FILE_NO_HYPHEN="${FILE_NO_COLON//-/_}"
    FILE_LOWERCASE="${FILE_NO_HYPHEN@L}"
    NEW_NAME=$FILE_LOWERCASE
    echo "processing $NEW_NAME"
    ffmpeg -i "$FILE" -vf scale=1920:1080 -c:a copy -c:v libx264 -preset slow -crf 32 -y $OUT/${NEW_NAME}_xl.mp4
    ffmpeg -i "$FILE" -vf scale=1280:720 -c:a copy -c:v libx264 -preset slow -crf 32 -y $OUT/${NEW_NAME}_l.mp4
    ffmpeg -i "$FILE" -vf scale=854:480 -c:a copy -c:v libx264 -preset slow -crf 32 -y $OUT/${NEW_NAME}_m.mp4
    ffmpeg -i "$FILE" -vf scale=-1:480,crop=in_w/3:in_h:in_w/3:0 -c:a copy -c:v libx264 -preset slow -crf 32 -y $OUT/${NEW_NAME}_s.mp4
done