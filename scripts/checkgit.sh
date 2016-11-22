# inspired by https://github.com/graphql/graphql-js/blob/master/resources/checkgit.sh
#
# This script determines if current git state is the up to date master. If so
# it exits normally. If not it prompts for an explicit continue. This script
# intends to protect from versioning for NPM without first pushing changes
# and including any changes on master.
#

# First fetch to ensure git is up to date. Fail-fast if this fails.
git fetch;
if [[ $? -ne 0 ]]; then exit 1; fi;

# Extract useful information.
GITBRANCH=$(git branch -v 2> /dev/null | sed '/^[^*]/d');
GITBRANCHNAME=$(echo "$GITBRANCH" | sed 's/* \([A-Za-z0-9_\-]*\).*/\1/');
GITBRANCHSYNC=$(echo "$GITBRANCH" | sed 's/* [^[]*.\([^]]*\).*/\1/');

# Check if master is checked out
if [ "$GITBRANCHNAME" != "master" ]; then
  echo "Branch is not master"
  exit 1
fi;

# Check if branch is synced with remote
if [ "$GITBRANCHSYNC" != "" ]; then
  echo "Branch is not synced with remote"
  exit 1
fi;
