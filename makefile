#------Colors--------
EOC		=	"\033[0;0m"
RED		=	"\033[1;31m"
YELLOW	=	"\033[1;33m"
GREEN	=	"\033[1;32m"
#====================

all: up

up:	
	@echo $(GREEN) Starting Containers ... $(EOC);
	@BUILD_TARGET=prod docker-compose -f ./docker-compose.yml up --build

dev_up:	
	@echo $(GREEN) Starting Containers ... $(EOC);
	@BUILD_TARGET=dev docker-compose -f ./docker-compose.yml up --build

silent:	
	@echo $(GREEN) Starting Containers silently ... $(EOC);
	@BUILD_TARGET=prod docker-compose -f ./docker-compose.yml up -d --build

down:
	@docker-compose -f ./docker-compose.yml down
	@echo $(YELLOW) Containers Removed $(EOC);

clean:
	@docker-compose -f ./docker-compose.yml down --rmi all
	@docker volume prune -a
	@echo $(RED) Containers, Images and Volumes Removed $(EOC);

docker_clean:
	@docker volume prune -a
	@docker system prune -a
	@echo $(RED) Containers, Images, Volumes and Build Cache Removed $(EOC);

re: clean all

dev_re:	clean dev_up

.PHONY: up