
.PHONY: deploy
deploy:
	rsync -avz \
		--exclude .git \
		--exclude .gitignore \
		--exclude Makefile \
		--exclude README.md \
		--exclude .DS_Store . qqtimer@qqtimer.net:~/qqtimer.net/
	echo "Done deploying. Go to http://www.qqtimer.net/"