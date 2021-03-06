# Kubenetes-Learning
It's a repository to track down my kubernetes learning progress.

# Git Markdown Syntax
I am learning Markdown syntax [here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) in writing this Markdown.

# Resources
1. [Docker toolbox](https://www.docker.com/products/docker-toolbox)
   Install 'docker toolbox' turning off Hyper-V option, if you run Windows 10.

2. [Minikube] (https://github.com/kubernetes/minikube/releases)
   Download the latest minikube and rename/move it to c:\windows\minikube.exe. Minikube runs single-node kubenetes cluster on your local machine in VirtualBox. 

3. [Kubectl] (https://github.com/eirslett/kubectl-windows/releases/tag/v1.5.0)
   Download the 1.5.0 version and move it to c:\windows\kubectl.exe

# Start Single-node Kubernetes with Minikube
1. Run 'Docker Quick Start Terminal' to create and initialize 'default' docker virtualbox.
2. Open 'Powershell' and run 'minikube start'. It creates 'minikube' or 'minikubeVM' instance in VirtualBox.
3. Please remove '.minikube' folder by 'rm -rf ~/.minikube', if 'minikube start' fails anyway.

# TODO
## TODO 1: Build my own node js and deploy it to Kubernetes
- A very simple 'hello world' - [iminsik/node-hello-app](https://hub.docker.com/r/iminsik/node-web-app/) was built and pushed to Docker Hub.

```javascript
// docker/server.js
'use strict';

const express = require('express'),
      PORT = 8080,
      app = express();

app.get('/', function (req, res) {
	res.send('Hello World\n');
});

app.listen(PORT);
```

- The docker image could be deployed to local single-node minikube cluster with 10 replicas set.
```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deployment
spec:
  replicas: 10 
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: iminsik 
        image: iminsik/node-web-app 
        ports:
        - name: nodejs-port
          containerPort: 3000
```

```bash
kubectl create -f kubernetes-yaml/deployment/helloworld.yml
```
![helloworld-deployment](https://github.com/iminsik/kubenetes-learning/blob/master/GIF/helloworld-deployment.gif)
You can see more instructions on [Kubernetes Dashboard](https://kubernetes.io/docs/user-guide/ui/)

## TODO 2: deploy the helloworld app with health check
- The docker image could be deployed to local single-node minikube cluster with 10 replicas set.
```yml
#deployment/helloworld-deployment-healthcheck.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deployment
spec:
  replicas: 10 
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: iminsik 
        image: iminsik/node-web-app 
        ports:
        - name: nodejs-port
          containerPort: 8080
        #BEGIN: Checking App Health
        livenessProbe:
          httpGet:
            path: /
            port: nodejs-port
          initialDelaySeconds: 10
          timeoutSeconds: 20
        #END:
```

```bash
kubectl create -f kubernetes-yaml/deployment/helloworld-healthcheck.yml
```

## TODO 3: deploy the helloworld app to specific node with selector
I've added 'deployment/helloworld-nodeselector.yml' example, but still can't figure out how I can assign the selector to each node. I will take a look at tutorial again.

## TODO 4: create secrets and use it in helloworld app.
Create a secrete for username and password encoded as BASE64.
```yml
# deployment/helloworld-secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: db-secrets
type: Opaque
data:
  username: cm9vdA==
  password: cGFzc3dvcmQ=
```

Map the secrets to '/etc/creds/' directory in 'helloworld' app. 'username' is mapped to '/etc/creds/username', and 'password' mapped to '/etc/creds/password'.
```yml
# deployment/helloworld-secrets-volumes.yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deployment
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: helloworld
    spec:
      containers:
      - name: iminsik
        image: iminsik/node-web-app
        ports:
        - name: nodejs-port
          containerPort: 8080
        volumeMounts:
        - name: cred-volume
          mountPath: /etc/creds
          readOnly: true
      volumes:
      - name: cred-volume
        secret: 
          secretName: db-secrets
```

## TODO 5: create service for the app running with [MySQL database](https://hub.docker.com/_/mysql/) service
'helloworld-db-service' is talking to 'database-service' to persist visitors number in MySQL database.

```yml
# service-discovery/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: helloworld-secrets
type: Opaque
data:
  username: aGVsbG93b3JsZA==
  password: cGFzc3dvcmQ=
  rootPassword: cm9vdHBhc3N3b3JK
  database: aGVsbG93b3JsZA==
```
```yml
# service-discovery/database.yml
apiVersion: v1
kind: Pod
metadata:
  name: database
  labels:
    app: database
spec:
  containers:
  - name: mysql
    image: mysql:5.7
    ports:
    - name: mysql-port
      containerPort: 3306
    env:
    - name: MYSQL_ROOT_PASSWORD
      valueFrom:
        secretKeyRef:
          name: helloworld-secrets
          key: rootPassword
    - name: MYSQL_USER
      valueFrom:
        secretKeyRef:
          name: helloworld-secrets
          key: username
    - name: MYSQL_PASSWORD
      valueFrom:
        secretKeyRef:
          name: helloworld-secrets
          key: password
    - name: MYSQL_DATABASE
      valueFrom:
        secretKeyRef:
          name: helloworld-secrets
          key: database
```

```yml
# service-discovery/database-service.yml
apiVersion: v1
kind: Service
metadata:
  name: database-service
spec:
  ports:
  - port: 3306
    protocol: TCP
  selector:
    app: database
  type: NodePort
```

```yml
# service-discovery/helloworld-db.yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: helloworld-deploymemnt
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: helloworld-db
    spec:
      containers:
      - name: iminsik
        image: iminsik/node-web-db-app
        ports:
        - name: nodejs-port
          containerPort: 3000
        env:
        - name: MYSQL_HOST
          value: database-service
        - name: MYSQL_USER
          value: root
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: helloworld-secrets
              key: rootPassword
        - name: MYSQL_DATABASE
          valueFrom:
            secretKeyRef:
              name: helloworld-secrets
              key: database
```

```yml
# service-discovery/helloworld-db-service.yml
apiVersion: v1
kind: Service
metadata:
  name: helloworld-db-service
spec:
  ports:
  - port: 3000
    protocol: TCP
  selector:
    app: helloworld-db
  type: NodePort
```

```bash
$curl -s $(minikube service helloworld-db-service --url)
Hello World! You are visitor number34
```
## TODO 6: running app with AWS volume to keep persistent data

## TODO 7: running app with configmap
```
//reverseproxy.conf
server {
  listen  80;
  server_name localhost;

  location / {
    proxy_bind  127.0.0.1;
    proxy_pass  http://127.0.0.1:8080;
  }

  error_page  500 502 503 504 /50x.html;
  location = /50x.html  {
    root  /usr/share/nginx/html;
  }
}
```

```bash
kubectl create configmap nginx-config --from-file=reverseproxy.conf
```
nginx.yml generates a pod with 2 containers, 'nginx' and 'node-web-app'. 'nginx' server functions as reverseproxy with configmap volume.

```yml
#nginx.yml

apiVersion: v1
kind: Pod
metadata:
  name: helloworld-nginx
  labels:
    app: helloworld-nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.11
    ports:
    - containerPort: 80
    volumeMounts:
    - name: config-volume
      mountPath: /etc/nginx/conf.d
  - name: iminsik
    image: iminsik/node-web-app
    ports:
    - containerPort: 8080
  volumes:
  - name: config-volume
    configMap:
      name: nginx-config
      items:
      - key: reverseproxy.conf
        path: reverseproxy.conf 
```
## TODO 8: deploy and rollback with terminationGracePeriodSeconds
Some Kubernetes documents may help:
- [Deployment and Rollback](https://kubernetes.io/docs/user-guide/deployments/)
- [Graceful Shutdown](https://pracucci.com/graceful-shutdown-of-kubernetes-pods.html)

