
.PHONY: deploy
deploy:
	rsync -avz \
		--exclude .DS_Store \
		src/ \
		qqtimer@qqtimer.net:~/qqtimer.net/
	echo "Done deploying. Go to http://www.qqtimer.net/"
