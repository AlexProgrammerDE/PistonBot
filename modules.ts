export interface ModuleType {
  [server: string]: ServerConfig
}

export interface ServerConfig {
  coords: boolean
  tps: boolean
  navigation: boolean
  ping: boolean
  help: boolean
  tp: boolean
  rules: boolean
  report: boolean
  bible: boolean
  about: boolean
  armor: boolean
  turn: boolean
  bchelp: boolean
  spam: boolean
  eat: boolean
  attack: boolean
  totem: boolean
  web?: {
    port: number
  }
  viewer?: {
    port: number
  }
  inventory?: {
    port: number
  }
  api?: {
    port: number
  }
  gamemode: boolean
  hi: boolean
}

export const serverModules: ModuleType = {
  '7b7t': {
    coords: true,
    tps: true,
    navigation: true,
    ping: true,
    help: true,
    tp: true,
    rules: true,
    report: true,
    bible: true,
    about: true,
    armor: true,
    turn: true,
    bchelp: true,
    spam: false,
    eat: true,
    attack: true,
    totem: true,
    web: {
      port: 8080
    },
    viewer: {
      port: 8880
    },
    inventory: {
      port: 2095
    },
    api: {
      port: 8880
    },
    gamemode: true,
    hi: true
  },
  '2b4u': {
    coords: true,
    tps: true,
    navigation: true,
    ping: true,
    help: true,
    tp: true,
    rules: true,
    report: true,
    bible: true,
    about: true,
    armor: true,
    turn: true,
    bchelp: true,
    spam: false,
    eat: true,
    attack: true,
    totem: true,
    gamemode: true,
    hi: true
  },
  openanarchy: {
    coords: true,
    tps: true,
    navigation: true,
    ping: true,
    help: true,
    tp: true,
    rules: true,
    report: true,
    bible: true,
    about: true,
    armor: true,
    turn: true,
    bchelp: true,
    spam: false,
    eat: true,
    attack: true,
    totem: true,
    gamemode: true,
    hi: true
  },
  localhost: {
    coords: true,
    tps: true,
    navigation: true,
    ping: true,
    help: true,
    tp: true,
    rules: true,
    report: true,
    bible: true,
    about: true,
    armor: true,
    turn: true,
    bchelp: true,
    spam: false,
    eat: true,
    attack: true,
    totem: true,
    gamemode: true,
    hi: true
  }
}
