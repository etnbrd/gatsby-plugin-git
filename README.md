# gatsby-plugin-git

Plugin for fetching a single revision of a remote repository into gatsby source tree.

Keeping the code and content together in a single revision history might not always be a solution (e.g. content is used in multiple sites).
This plugin allows to separate the content from your code, while keeping a clear relation between the code and the content, thus, avoiding error due to inconsistencies between code and content.

## Install

`npm install --save gatsby-plugin-git`

or 

`yarn add gatsby-plugin-git`

## How to use

Hide a folder from your git revision history.

```.gitignore
/content
```

Then configure the plugin to fetch a specific commit from your remote repository.

```javascript
module.exports = {
  plugins: [
    // You can have multiple instances of this plugin
    // to fetch multiple 

    {
      resolve: 'gatsby-plugin-git',
      options: {

        // remote name, default to origin
        remote: 'origin',

        // SHA1 revision to fetch and checkout
        revision: '7beed15dd03e03f9f9a183ed3b53f0e51f6dbbd7',

        // url of the repository to fetch
        url: `https://github.com/gatsbyjs/gatsby.git`,

        // folder in which to put the repository
        path: `${__dirname}/content/my-repo`,
      }
    },
  ]
}
```

:warning: 
This plugin will checkout the specified revision, discarding your current branch tip, even if the revision is the head of your current branch.
It is specifically intended for deployment, to fetch a single revision of a repository (not the full history) and check it out.

You might want to condition this plugin to run only on deployment, and manually put your repository in your local `content` folder, e.g. using submodules, or symbolic links.