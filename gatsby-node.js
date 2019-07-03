const git = require('simple-git/promise')
const fs = require('fs-extra')


const folderExists = async (path) => {

  const check = async (path) => {
    try {
      await fs.stat(path)
      return true
    } catch(e) {
      return e
    }
  }

  const ret = await check(path)

  if (ret === true)
    return true

  if (ret.code === 'ENOENT') {
    await fs.mkdirp(path)
    return check(path)
  }

  return ret
}


const repoInitialized = async (repo, path) => {

  const check = async (repo, path) => {
    try {
      const toplevel = (await repo.revparse(['--show-toplevel']))
        // the slice remove the \n ending the returned string
        .slice(0, -1)

      return toplevel === path
    } catch(e) {
      return false;
    }
  }

  const ret = await check(repo, path)

  if (ret === true)
    return true

  await repo.init()
  return check(repo, path)
}


const remotePresent = async (repo, remote, url) => {

  const check = async (repo, remote, url) => {
    const remotes = await repo.getRemotes(true)
    return remotes.some(r => r.name === remote && r.refs.fetch === url)
  }

  const ret = await check(repo, remote, url)

  if (ret === true)
    return true

  await repo.addRemote(remote, url)
  return check(repo, remote, url)
}


const revisionFetched = async (repo, remote, revision) => {

  const check = async (repo, revision) => {
    try {
      const log = await repo.log([revision])
      return log.latest.hash === revision
    } catch (e) {
      return e
    }
  }

  const ret = await check(repo, revision)

  if (ret === true)
    return true

  // Fetch a single revision
  await repo.fetch([remote, revision, '--depth=1'])
  return check(repo, revision)
}


const revisionCheckedout = async (repo, revision) => {

  const check = async (repo, revision) => {
    try {
      const head = (await repo.revparse(['HEAD']))
        // the slice remove the \n ending the returned string
        .slice(0, -1)
      return head === revision
    } catch (e) {
      return false
    }
  }

  const ret = await check(repo, revision)

  if (ret === true)
    return true

  // Checkout a revision
  await repo.checkout(revision)
  return check(repo, revision)
}


const fetch = async ({
  path,
  url,
  remote = 'origin',
  revision,
}) => {
  await folderExists(path)
  const repo = await git(path).silent(true)
  await repoInitialized(repo, path)
  await remotePresent(repo, remote, url)
  await revisionFetched(repo, remote, revision)
  await revisionCheckedout(repo, revision)
}

exports.onPreBootstrap = async (_, { path, url, remote, revision }) => {
  console.log('')
  console.log('waiting for ' + path)
  return await fetch({ path, url, remote, revision })
}