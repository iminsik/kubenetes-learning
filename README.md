# Kubenetes-Learning
It's a repository to track down my kubernetes learning progress.

# Git Markdown Syntax
I am learning Markdown syntax [here](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) in writing this Markdown.

# Resources
1. [Docker toolbox](https://www.docker.com/products/docker-toolbox)
   Minikube runs single-node kubenetes cluster on your local machine with VirtualBox. Please, install 'docker toolbox' turning off Hyper-V option, if you run Windows 10.

2. [Minikube] (https://github.com/kubernetes/minikube/releases)
   Download the latest minikube and rename/move it to c:\windows\minikube.exe.

3. [Kubectl] (https://github.com/eirslett/kubectl-windows/releases/tag/v1.5.0)
   Download the 1.5.0 version and move it to c:\windows\kubectl.exe

# Start Single-node Kubernetes with Minikube
1. Run 'Docker Quick Start Terminal' to create and initialize 'default' docker virtualbox.
2. Open 'Powershell' and run 'minikube start'. It creates 'minikube' or 'minikubeVM' instance in VirtualBox.

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
## TODO 2: deploy the helloworld app with health check
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

