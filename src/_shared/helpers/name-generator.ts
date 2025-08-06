import { uniqueNamesGenerator } from "unique-names-generator";

// Name dictionaries
const NEW_202010 = [
    "Power", "Super", "Mega", "Ultra", "Hyper", "Neo", "Quantum", "Alpha", "Beta", "Gamma", "Delta", "Omega",
    "Stellar", "Cosmic", "Galaxy", "Nova", "Pulsar", "Quasar", "Nebula", "Solar", "Lunar", "Meteor",
    "Thunder", "Lightning", "Storm", "Blaze", "Frost", "Ice", "Fire", "Water", "Earth", "Wind",
    "Shadow", "Light", "Dark", "Bright", "Glow", "Shine", "Flash", "Spark", "Bolt", "Strike"
];

const Animals = [
    "Tiger", "Lion", "Eagle", "Wolf", "Bear", "Shark", "Falcon", "Panther", "Leopard", "Cheetah",
    "Dragon", "Phoenix", "Griffin", "Hawk", "Owl", "Fox", "Rabbit", "Deer", "Horse", "Dolphin",
    "Whale", "Octopus", "Spider", "Butterfly", "Bee", "Ant", "Cat", "Dog", "Elephant", "Giraffe"
];

const Colors = [
    "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Black", "White", "Gray",
    "Silver", "Gold", "Bronze", "Crimson", "Scarlet", "Azure", "Emerald", "Violet", "Indigo", "Magenta",
    "Cyan", "Turquoise", "Amber", "Jade", "Ruby", "Sapphire", "Pearl", "Diamond", "Crystal", "Platinum"
];

const Cools = [
    "Ninja", "Samurai", "Warrior", "Knight", "Assassin", "Hunter", "Ranger", "Scout", "Sniper", "Gunner",
    "Pilot", "Captain", "Commander", "Admiral", "General", "Master", "Sensei", "Guru", "Wizard", "Mage",
    "Sage", "Oracle", "Prophet", "Guardian", "Protector", "Defender", "Champion", "Hero", "Legend", "Myth"
];

const Fruits = [
    "Apple", "Banana", "Cherry", "Grape", "Orange", "Peach", "Pear", "Plum", "Berry", "Mango",
    "Kiwi", "Lemon", "Lime", "Melon", "Papaya", "Coconut", "Avocado", "Pineapple", "Strawberry", "Blueberry",
    "Raspberry", "Blackberry", "Cranberry", "Pomegranate", "Watermelon", "Cantaloupe", "Honeydew", "Fig", "Date", "Olive"
];

const Marvels = [
    "Iron", "Steel", "Titanium", "Vibranium", "Adamant", "Carbon", "Silicon", "Neon", "Xenon", "Argon",
    "Helium", "Hydrogen", "Oxygen", "Nitrogen", "Fluorine", "Chlorine", "Bromine", "Iodine", "Phosphorus", "Sulfur",
    "Magnesium", "Calcium", "Potassium", "Sodium", "Lithium", "Beryllium", "Boron", "Aluminum", "Copper", "Zinc"
];

export default class NameGenerator {
    public static PATTERN = "^[a-zA-Z0-9]{3,14}$";

    public static generateName(): string {
        console.log("[NameGenerator] generateName called");
        const dictionaries = [Colors, Animals, Marvels, Fruits, Cools, NEW_202010];

        const randomDictionaryIndex = Math.floor(Math.random() * dictionaries.length);
        const pickedDictionary = dictionaries[randomDictionaryIndex];

        const shortName = uniqueNamesGenerator({
            dictionaries: [pickedDictionary],
            separator: "",
            length: 1,
        });

        const numberLength = shortName.length < 10 ? 5 : 14 - shortName.length;
        let maxNumber = "";
        for (let i = 0; i < numberLength; i++) {
            maxNumber = `9${maxNumber}`;
        }
        const randomNumber = Math.floor(Math.random() * +maxNumber);

        const generatedName = `${shortName}${randomNumber}`;
        console.log("[NameGenerator] generated name:", generatedName);
        return generatedName;
    }

    public static validateName(name: string): boolean {
        console.log("[NameGenerator] validateName called with:", name);
        const regex = new RegExp(NameGenerator.PATTERN);
        const isValid = (name || "").match(regex) !== null;
        console.log("[NameGenerator] validation result:", isValid);
        return isValid;
    }
}
