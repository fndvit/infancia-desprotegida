ffmpeg -i intro.mov -profile:v main -pix_fmt yuv420p -vf scale=1280:674 ../public/video/intro.mp4
ffmpeg -i coral-polluted.mov -profile:v main -pix_fmt yuv420p -vf scale=1280:674 ../public/video/coral-polluted.mp4
ffmpeg -i header.mov -profile:v main -pix_fmt yuv420p -vf scale=1280:674 ../public/video/header.mp4
ffmpeg -i harm_animals.mov -profile:v main -pix_fmt yuv420p -x264opts keyint=1 -vf scale=1600:900 ../public/video/harm_to_animals.mp4
ffmpeg -i litter.mov -profile:v main -pix_fmt yuv420p -x264opts keyint=1 -vf scale=1600:900 ../public/video/litter.mp4
ffmpeg -i waste.mov -profile:v main -pix_fmt yuv420p -vf scale=1280:674 ../public/video/waste.mp4
