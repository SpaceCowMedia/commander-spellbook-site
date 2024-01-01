#! /bin/bash

export S3_BUCKET=cdn.commanderspellbook.com
export CACHE_CONTROL_MAX_AGE=1
export DISTRIBUTION_ID=E16YLRUSY0N705
export NEXT_PUBLIC_EDITOR_BACKEND_URL=https://backend.commanderspellbook.com

aws eks --region us-east-2 update-kubeconfig --name spellbook-prod-cluster &&

aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 083767677168.dkr.ecr.us-east-2.amazonaws.com &&

docker build -t spellbook-client-prod-ecr:latest . &&

id=$(docker create spellbook-client-prod-ecr:latest) &&

docker cp $id:/app/.next/static _next &&

docker rm -v $id &&

aws s3 cp \
    --recursive \
    --cache-control "max-age=$CACHE_CONTROL_MAX_AGE" \
    _next/ s3://$S3_BUCKET/_next/static &&

aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" &&

rm -r _next &&

docker tag spellbook-client-prod-ecr:latest 083767677168.dkr.ecr.us-east-2.amazonaws.com/spellbook-client-prod-ecr:latest &&

docker push 083767677168.dkr.ecr.us-east-2.amazonaws.com/spellbook-client-prod-ecr:latest &&

#kubectl apply -k .kubernetes &&

kubectl rollout restart deployment/spellbook-client -n spellbook
