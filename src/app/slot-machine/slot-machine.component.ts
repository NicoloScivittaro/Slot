import { Component } from '@angular/core';

type SlotSymbol = '🍒' | '🍋' | '🍊' | '🍉' | '🔔' | '⭐' | '🌟' | '🎰'; // 🌟 = Wild, 🎰 = Jolly

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss']
})
export class SlotMachineComponent {
  symbols: SlotSymbol[] = [
    '🍒', '🍒', '🍒',  // Più frequenti
    '🍋', '🍋', '🍋', '🍊', '🍊','🍊',
    '🍉', '🍉','🍉', '🔔','🔔',
    '⭐','⭐',
    '🌟', // Wild meno frequente
    '🎰'  // Jolly molto raro
  ];


  reels: SlotSymbol[][] = Array(5).fill([]).map(() => Array(3).fill('')); // 5 rulli, 3 simboli ciascuno
  balance: number = 10; // Saldo iniziale
  betAmount: number = 1; // Puntata iniziale
  isSpinning: boolean = false;
  result: string = '';
  winningLines: string[] = [];
  isBonusActive: boolean = false;
  remainingBonusSpins: number = 0;
  bonusMultiplier: number = 1;
  autoSpinCount: number = 0; // Numero di giri automatici selezionati
remainingAutoSpins: number = 0; // Giri automatici rimanenti
isAutoSpinning: boolean = false; // Stato dell'Auto Spin


  linePayments: { [key in SlotSymbol]: number } = {
    '🍒': 1,
    '🍋': 2,
    '🍊': 3,
    '🍉': 4,
    '🔔': 5,
    '⭐': 8,  // Ridotto
    '🌟': 0,
    '🎰': 10  // Ridotto
  };


  payLines: number[][] = [
    [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], // Orizzontali
    [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], // Zig-zag
    [0, 0, 1, 2, 2], [2, 2, 1, 0, 0]  // Diagonali
  ];

  spin() {
    if (this.isSpinning || this.balance < this.betAmount) {
      this.result = this.balance < this.betAmount ? 'Saldo insufficiente!' : '';
      this.isAutoSpinning = false; // Interrompe l'Auto Spin in caso di saldo insufficiente
      return;
    }

    this.isSpinning = true;
    this.result = '';
    this.winningLines = [];
    this.balance -= this.betAmount;

    let spins = 0;
    const spinInterval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        this.reels[i] = [
          this.getRandomSymbol(),
          this.getRandomSymbol(),
          this.getRandomSymbol()
        ];
      }
      spins++;
      if (spins >= 30) {
        clearInterval(spinInterval);
        this.isSpinning = false;
        this.checkResult();

        // Interrompe l'Auto Spin se il saldo è insufficiente
        if (this.isAutoSpinning && this.balance < this.betAmount) {
          this.isAutoSpinning = false;
        }
      }
    }, 100);
  }


  getRandomSymbol(): SlotSymbol {
    const totalSymbols = this.symbols.length;
    const weightedRandomIndex = Math.floor(
      Math.pow(Math.random(), 2) * totalSymbols // Riduce le probabilità di simboli rari
    );
    return this.symbols[weightedRandomIndex];
  }


  checkResult() {
    let hasWin = false;

    // Controllo delle linee di pagamento
    this.payLines.forEach((line) => {
      const symbolsInLine = line.map((row, col) => this.reels[col][row]);
      const currentSymbol = symbolsInLine[0];
      let count = 1;

      for (let i = 1; i < symbolsInLine.length; i++) {
        if (symbolsInLine[i] === currentSymbol || symbolsInLine[i] === '🌟') {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        const multiplier = count === 3 ? 1 : count === 4 ? 2 : 3;
        this.addWinningLine(`Linea vincente con ${currentSymbol}`, currentSymbol as SlotSymbol, multiplier);
        hasWin = true;
      }
    });

    // Controllo per 3 o più 🎰 in qualsiasi posizione
    const allSymbols = this.reels.flat(); // Crea un array unico con tutti i simboli della griglia
    const jokerCount = allSymbols.filter((symbol) => symbol === '🎰').length;

    if (jokerCount >= 3) {
      this.activateBonus(); // Avvia il bonus
      this.result = `🎰 BONUS ATTIVATO! Hai trovato ${jokerCount} simboli Jolly!`;
      hasWin = true;
    }

    if (!hasWin) {
      this.result = '😢 Nessuna vincita. Riprova!';
    }
  }


  addWinningLine(description: string, symbol: SlotSymbol, multiplier: number) {
    const winnings = this.linePayments[symbol] * multiplier * this.betAmount;
    this.winningLines.push(`${description} - Vincite: ${winnings}€`);
    this.balance += winnings;
  }

  activateBonus() {
    this.remainingBonusSpins = 10;
    this.bonusMultiplier = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
    this.isBonusActive = true;
    console.log(`🎉 Bonus attivato! Giri gratuiti: ${this.remainingBonusSpins}, Moltiplicatore: x${this.bonusMultiplier}`);
  }

  spinBonus() {
    if (this.remainingBonusSpins <= 0) {
      this.isBonusActive = false;
      console.log('🎉 Bonus terminato!');
      return;
    }

    this.spinReels();
    const winnings = this.calculateFreeSpinWinnings() * this.bonusMultiplier;
    this.balance += winnings;

    console.log(`🎰 Giro bonus completato. Vincite: ${winnings}€`);
    this.remainingBonusSpins--;

    if (this.remainingBonusSpins === 0) {
      this.isBonusActive = false;
      this.result = `🎉 Bonus completato!`;
    }
  }

  spinReels() {
    for (let i = 0; i < 5; i++) {
      this.reels[i] = [
        this.getRandomSymbol(),
        this.getRandomSymbol(),
        this.getRandomSymbol()
      ];
    }
    this.logReelsState();
  }

  calculateFreeSpinWinnings(): number {
    let totalWinnings = 0;
    this.payLines.forEach((line) => {
      const symbolsInLine = line.map((row, col) => this.reels[col][row]);
      const currentSymbol = symbolsInLine[0];
      let count = 1;

      for (let i = 1; i < symbolsInLine.length; i++) {
        if (symbolsInLine[i] === currentSymbol || symbolsInLine[i] === '🌟') {
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        const multiplier = count === 3 ? 1 : count === 4 ? 2 : 3;
        totalWinnings += this.linePayments[currentSymbol as SlotSymbol] * multiplier;
      }
    });
    return totalWinnings;
  }

  logReelsState() {
    console.log('Stato dei rulli:');
    this.reels.forEach((reel, index) => {
      console.log(`Rullo ${index + 1}: ${reel.join(' | ')}`);
    });
  }
  startAutoSpin() {
    if (this.isSpinning || this.isBonusActive || this.balance < this.betAmount || this.autoSpinCount <= 0) {
      return;
    }

    this.isAutoSpinning = true;
    this.remainingAutoSpins = this.autoSpinCount;

    const autoSpinInterval = setInterval(() => {
      // Se i giri sono terminati o il saldo è insufficiente, ferma l'auto-spin
      if (this.remainingAutoSpins <= 0 || this.balance < this.betAmount) {
        this.isAutoSpinning = false;
        clearInterval(autoSpinInterval);
        return;
      }

      // Controlla se è possibile avviare un giro
      if (!this.isSpinning) {
        this.spin(); // Avvia un giro
        this.remainingAutoSpins--; // Riduce il conteggio dei giri rimanenti
      }
    }, 1500); // Tempo tra i giri
  }


}
