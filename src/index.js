import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from "./Card.js";

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(card) {
        super(card);
        this.card = card;
    }

    getDescriptions(){
        let str1 = getCreatureDescription(card);
        let str2 = super.getDescriptions();
        return [str2, str1];
    }
}

class Duck extends Card {
    constructor(card) {
        super(card);
        this.card = card;
        this.currentPower = 2;
        this.name = 'Мирная утка';
    }

    quacks(){
        console.log('quack')
    }

    swims() {
        console.log('float: both;')
    }

}

class Dog extends card {
    constructor(card) {
        super();
        this.card = card;
        this.currentPower = 3;
        this.name = 'Пес-бандит';
    }
}

class Trasher extends Dog {
    constructor(card) {
        super();
        this.card = card;
        this.currentPower = 5;
        this.name = 'Громила';
    }

    getDescriptions() {
        const text = super.getDescriptions();
        return ['При атаке получает на 1 урн меньше', text];
    }
    modifyTakenDamage (value, fromCard, gameContext, continuation) {

       if (value >= 2) {
           this.view.signalAbility()
        }
        return super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
    }
}
// Основа для утки.
//function Duck() {
 //   this.quacks = function () { console.log('quack') };
 //   this.swims = function () { console.log('float: both;') };
//}


// Основа для собаки.
//function Dog() {
//}


// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck()
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Trasher(),
    new Dog()
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
