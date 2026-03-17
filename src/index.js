// index.js
import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

function isDuck(card) {
    return card && card.quacks && card.swims;
}

function isDog(card) {
    return card instanceof Dog;
}

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
    getDescriptions() {
        const creatureDesc = getCreatureDescription(this);
        const parentDescs = super.getDescriptions();
        return [creatureDesc, ...parentDescs];
    }
}

class Duck extends Creature {
    constructor(name = 'Мирная утка', maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

// Класс Собаки
class Dog extends Creature {
    constructor(name = 'Пес-бандит', maxPower = 3, image = null) {
        super(name, maxPower, image);
    }
}

class Trasher extends Dog {
    constructor(name = 'Громила', maxPower = 5, image = null) {
        super(name, maxPower, image);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const reducedValue = Math.max(value - 1, 0);

        this.view.signalAbility(() => {
            continuation(reducedValue);
        });
    }

    getDescriptions() {
        const parentDescs = super.getDescriptions();
        return ['Получает на 1 меньше урона', ...parentDescs];
    }
}

// Класс Гатлинга
class Gatling extends Creature {
    constructor(name = 'Гатлинг', maxPower = 6, image = null) {
        super(name, maxPower, image);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {oppositePlayer} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        const cards = oppositePlayer.table.filter(card => card !== null);

        if (cards.length === 0) {
            taskQueue.continueWith(continuation);
            return;
        }

        let currentIndex = 0;

        const attackNext = (onDone) => {
            if (currentIndex < cards.length) {
                const card = cards[currentIndex];
                currentIndex++;

                this.dealDamageToCreature(2, card, gameContext, () => {
                    attackNext(onDone);
                });
            } else {
                onDone();
            }
        };

        taskQueue.push(attackNext);
        taskQueue.continueWith(continuation);
    }

    getDescriptions() {
        const parentDescs = super.getDescriptions();
        return ['Наносит 2 урона всем картам противника по очереди', ...parentDescs];
    }
}

class Lad extends Dog {
    constructor(name = 'Браток', maxPower = 2, image = null) {
        super(name, maxPower, image);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return count * (count + 1) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Math.max(Lad.getInGameCount() - 1, 0));
        super.doBeforeRemoving(continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        this.view.signalAbility(() => {
            continuation(value + bonus);
        });
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        const reducedValue = Math.max(value - bonus, 0);

        this.view.signalAbility(() => {
            continuation(reducedValue);
        });
    }

    getDescriptions() {
        const parentDescs = super.getDescriptions();
        const bonus = Lad.getBonus();
        const count = Lad.getInGameCount();

        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            return [
                `Чем их больше, тем они сильнее (сейчас ${count} братков, бонус ${bonus})`,
                ...parentDescs
            ];
        }

        return parentDescs;
    }
}

// Колода Шерифа (утки и гатлинг)
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
    new Gatling(),
    new Trasher(),
    new Trasher()
];

// Колода Бандита (громила и братки)
const banditStartDeck = [
    new Trasher(),
    new Lad(),
    new Lad(),
    new Duck(),
    new Gatling(),
    new Gatling(),
    new Trasher()
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
