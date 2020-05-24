for f in ./*.wav; do
	ffmpeg -i "$f" -af "atrim=0:15,areverse,silenceremove=start_periods=1:detection=peak:start_threshold=-90dB,areverse" -ar 44100 -ac 1 -b:a 192k "$f".output.mp3
done
rm *.wav
rename 's/\.wav\.output//' *.output.mp3
find . -name "*.mp3" -type 'f' -size -700c -delete
