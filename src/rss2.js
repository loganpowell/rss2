'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var convert = require('xml-js')
var config_1 = require('./config')
exports.default = function(ins) {
  var options = ins.options
  var isAtom = false
  var isContent = false
  var base = {
    _declaration: { _attributes: { version: '1.0', encoding: 'utf-8' } },
    rss: {
      _attributes: { version: '2.0' },
      channel: {
        title: { _text: options.title },
        link: { _text: options.link },
        description: { _text: options.description },
        lastBuildDate: {
          _text: options.updated ? options.updated.toUTCString() : new Date().toUTCString(),
        },
        docs: { _text: 'http://blogs.law.harvard.edu/tech/rss' },
        generator: { _text: options.generator || config_1.generator },
      },
    },
  }
  if (options.language) {
    base.rss.channel.language = { _text: options.language }
  }
  if (options.image) {
    base.rss.channel.image = {
      title: { _text: options.title },
      url: { _text: options.image },
      link: { _text: options.link },
    }
  }
  if (options.copyright) {
    base.rss.channel.copyright = { _text: options.copyright }
  }
  ins.categories.map(function(category) {
    if (!base.rss.channel.category) {
      base.rss.channel.category = []
    }
    base.rss.channel.category.push({ _text: category })
  })
  var atomLink = options.feed || (options.feedLinks && options.feedLinks.atom)
  if (atomLink) {
    isAtom = true
    base.rss.channel['atom:link'] = [
      {
        _attributes: {
          href: atomLink,
          rel: 'self',
          type: 'application/rss+xml',
        },
      },
    ]
  }
  if (options.hub) {
    isAtom = true
    if (!base.rss.channel['atom:link']) {
      base.rss.channel['atom:link'] = []
    }
    base.rss.channel['atom:link'] = {
      _attributes: {
        href: options.hub,
        rel: 'hub',
      },
    }
  }
  base.rss.channel.item = []
  ins.items.map(function(entry) {
    var item = {}
    if (entry.title) {
      item.title = { _cdata: entry.title }
    }
    if (entry.link) {
      item.link = { _text: entry.link }
    }
    if (entry.guid) {
      item.guid = { _text: entry.guid }
    } else if (entry.link) {
      item.guid = { _text: entry.link }
    }
    if (entry.date) {
      item.pubDate = { _text: entry.date.toUTCString() }
    }
    if (entry.description) {
      item.description = { _cdata: entry.description }
    }
    if (entry.content) {
      isContent = true
      item['content:encoded'] = { _cdata: entry.content }
    }
    if (Array.isArray(entry.author)) {
      item.author = []
      entry.author.map(function(author) {
        if (author.email && author.name) {
          item.author.push({ _text: author.email + ' (' + author.name + ')' })
        } else if (author.name) {
          item.author.push({ _text: author.name })
        }
      })
    }
    if (entry.image) {
      const type = new URL(entry.image).pathname.split('.').slice(-1)[0]
      item.enclosure = { _attributes: { url: entry.image, length: 0, type: `image/${type}` } }
    }
    base.rss.channel.item.push(item)
  })
  if (isContent) {
    base.rss._attributes['xmlns:content'] = 'http://purl.org/rss/1.0/modules/content/'
  }
  if (isAtom) {
    base.rss._attributes['xmlns:atom'] = 'http://www.w3.org/2005/Atom'
  }
  return convert.js2xml(base, { compact: true, ignoreComment: true, spaces: 4 })
}
//# sourceMappingURL=rss2.js.map
