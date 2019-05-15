ENV ?= .env
include ${ENV}
export $(shell sed 's/=.*//' ${ENV})

dc := docker-compose
#ifneq ($(DCOMPOSE_FILE),"")
#    dc := docker-compose -f docker-compose-$(DCOMPOSE_FILE).yml
#endif
run := ${dc} run
m := ${run} run migration --
npm := ${run} restful_api /usr/local/bin/npm

.env:
	@cp .env.tpl .env

up: .env
	@${dc} up

stop:
	@${dc} stop

build: .env
	@${dc} build

shell: .env
	@${run} restful_api /bin/sh

install: build
	@${npm} install

install-dev-%:
	@${npm} install --save-dev $*

install-%:
	@${npm} install --save $*

test: .env
	@${npm} run test

unittest: .env
	@${npm} run unittest
	
%:
	@${npm} run $*
