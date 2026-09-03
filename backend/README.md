# SaraTube backend API (`saratube-backend`)

This is the Express API that serves `/api` and `/uploads` for both SASA
hostnames. It is the source for the image
`192.168.0.101:5050/saratube-backend`, deployed by
`k8s/sasa/backend-deployment.yaml`.

## Why it lives here

Until now this service had **no git repository at all**. `server.js` existed
only inside the running container, edited in place — the image directory still
carries a trail of `server.js.bak-child-pin`, `server.js.bak-child-login-api`
and similar files. There was no Argo CD application for it either, so the only
way to change the API was to mutate the cluster by hand, and nothing recorded
what was actually running.

Putting the source next to the manifest that deploys it makes the API
reviewable and reproducible, and the Deployment is now reconciled by the same
Argo CD application that already owns the `saratube-public` Ingress and the
`sasa-frontend-bridge` Service.

## Building

`Dockerfile` builds `FROM` the previously deployed image and replaces
`server.js`, so the Node runtime and `node_modules` stay byte-identical to what
was already running and the change under review is exactly the source diff:

```bash
docker build -t 192.168.0.101:5050/saratube-backend:<tag> backend/
docker push 192.168.0.101:5050/saratube-backend:<tag>
# then bump the image in k8s/sasa/backend-deployment.yaml and let Argo CD sync
```

There is no build CI for this image yet; the frontend's GitHub Actions pipeline
only builds `sasa-frontend`. Adding one is the natural next step.

## Tests

`tests/child-pin-contract.sh` exercises the child-PIN contract against a live
deployment, including the cases that must fail. It creates throwaway accounts
under `@example.invalid` and deletes the child profiles it made.
