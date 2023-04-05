# 가상컴퓨터에서 express를 설치. 즉, backend서버
# 개발용
FROM node:14

WORKDIR /myfolder/
COPY ./package.json /myfolder/ 
# yarn install을 하기위해서 설치 목록이 있는 package.json을 먼저 복사
COPY ./yarn.lock /myfolder/ 
# 버전 확인을 위해 존재하는 yarn.lock도 먼저 복사함.
RUN yarn install

COPY . /myfolder/
CMD yarn start:dev
