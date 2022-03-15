interface ServerConfigs {
  [server: string]: ServerConfig
}

interface ServerConfig {
  version: string
  host: string
  port: number
  bridge: string
}

export const serverConfigs: ServerConfigs = {
  '7b7t': {
    version: '1.12.2',
    host: '7b7t.me',
    port: 25565,
    bridge: '738497579624431686'
  },
  '2b4u': {
    version: '1.12.2',
    host: '2b4u.cc',
    port: 25565,
    bridge: '835406354080333825'
  },
  openanarchy: {
    version: '1.16.5',
    host: 'openanarchy.org',
    port: 25565,
    bridge: '835406354080333825'
  },
  localhost: {
    version: '1.16.5',
    host: 'localhost',
    port: 25565,
    bridge: '834858576974708736'
  }
}
