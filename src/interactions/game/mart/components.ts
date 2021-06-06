import { MessageActionRowOptions } from "discord.js";

export const mart: MessageActionRowOptions = {
  type: "ACTION_ROW",
  components: [{
    type: "BUTTON",
    label: "Pokemon",
    customID: "pokemon",
    style: "SECONDARY",
    emoji: "525065701858476033"
  }, {
    type: "BUTTON",
    label: "Moves",
    customID: "moves",
    style: "SECONDARY"
  }, {
    type: "BUTTON",
    label: "Items",
    customID: "items",
    style: "SECONDARY"
  }]
};

export const pokemon: MessageActionRowOptions[] = [{
  type: "ACTION_ROW",
  components: [{
    type: "SELECT_MENU",
    placeholder: "Generation 1-2",
    customID: "gen1-2",
    options: [
      { label: "Bulbasaur", value: "Bulbasaur", emoji: "850902753596801045" },
      { label: "Charmander", value: "Charmander", emoji: "850901572418666558" },
      { label: "Squirtle", value: "Squirtle", emoji: "850902753504395265" },
      { label: "Chikorita", value: "Chikorita", emoji: "850902753571635240" },
      { label: "Cyndaquil", value: "Cyndaquil", emoji: "850902753562853427" },
      { label: "Totodile", value: "Totodile", emoji: "850902753298612275" },
    ],
    maxValues: 6,
  }]
}, {
  type: "ACTION_ROW",
  components: [{
    type: "SELECT_MENU",
    placeholder: "Generation 3-4",
    customID: "gen-3-4",
    options: [
      { label: "Treecko", value: "Treecko", emoji: "850967108333731852" },
      { label: "Torchic", value: "Torchic", emoji: "850967108413030441" },
      { label: "Mudkip", value: "Mudkip", emoji: "850967108404772875" },
      { label: "Turtwig", value: "Turtwig", emoji: "850967108644372480" },
      { label: "Chimchar", value: "Chimchar", emoji: "850967108703485963" },
      { label: "Piplup", value: "Piplup", emoji: "850967108645158912" }
    ],
    maxValues: 6
  }]
}, {
  type: "ACTION_ROW",
  components: [{
    type: "SELECT_MENU",
    placeholder: "Generation 5-6",
    customID: "gen5-6",
    options: [
      { label: "Snivy", value: "Snivy", emoji: "850967108648960000" },
      { label: "Tepig", value: "Tepig", emoji: "850967108656300082" },
      { label: "Oshawott", value: "Oshawott", emoji: "850967108450910209" },
      { label: "Chespin", value: "Chespin", emoji: "850967108678713354" },
      { label: "Fennekin", value: "Fennekin", emoji: "850967108678582282" },
      { label: "Froakie", value: "Froakie", emoji: "850967108707811368" }
    ],
    maxValues: 6
  }]
}, {
  type: "ACTION_ROW",
  components: [{
    type: "SELECT_MENU",
    placeholder: "Generation 7-8",
    customID: "gen7-8",
    options: [
      { label: "Rowlet", value: "Rowlet", emoji: "850967108686970910" },
      { label: "Litten", value: "Litten", emoji: "850967108678057985" },
      { label: "Popplio", value: "Popplio", emoji: "850967108682252308" },
      { label: "Grookey", value: "Grookey", emoji: "850967108694179870" },
      { label: "Scorbunny", value: "Scorbunny", emoji: "850967108333731851" },
      { label: "Sobble", value: "Sobble", emoji: "850967108678057984" }
    ],
    maxValues: 6
  }]
}, {
  type: "ACTION_ROW",
  components: [{
    type: "BUTTON",
    label: "Cancel",
    customID: "cancel",
    style: "DANGER"
  }, {
    type: "BUTTON",
    label: "Purchase",
    customID: "purchase",
    style: "SUCCESS",
    emoji: "🛒"
  }]
}];