import { Component } from '@angular/core';

type SlotSymbol = '🍒' | '🍋' | '🍊' | '🍉' | '🔔' | '⭐';

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss']
})
export class SlotMachineComponent {
  symbols: SlotSymbol[] = ['🍒', '🍒', '🍒', '🍋', '🍋', '🍊', '🍊', '🍉', '🔔', '⭐']; // Distribuzione ponderata
  reels = Array(5).fill([]).map(() => Array(3).fill('')); // 5 rulli, 3 simboli ciascuno
  balance = 1000; // Saldo iniziale
  isSpinning = false;
  result = '';
  winningLines: string[] = [];

  // Tabella dei pagamenti per linee specifiche
  linePayments: { [key in SlotSymbol]: number } = {
    '🍒': 5,
    '🍋': 10,
    '🍊': 15,
    '🍉': 20,
    '🔔': 50,
    '⭐': 100
  };

  // Linee di pagamento (coordinate dei simboli sui rulli)
  payLines: number[][] = [
    // Linee orizzontali
    [0, 0, 0, 0, 0], // Orizzontale superiore
    [1, 1, 1, 1, 1], // Orizzontale centrale
    [2, 2, 2, 2, 2], // Orizzontale inferiore

    // Diagonali
    [0, 1, 2, 1, 0], // Zig-zag 1
    [2, 1, 0, 1, 2], // Zig-zag 2
    [0, 0, 1, 2, 2], // Diagonale da sinistra a destra
    [2, 2, 1, 0, 0], // Diagonale da destra a sinistra

    // Linee a V
    [0, 1, 0, 1, 0], // V alta
    [2, 1, 2, 1, 2], // V bassa

    // Linee a piramide
    [0, 1, 2, 1, 0], // Piramide completa
    [2, 1, 0, 1, 2], // Piramide inversa

    // Linee a scaletta
    [0, 0, 1, 2, 2], // Scala ascendente
    [2, 2, 1, 0, 0], // Scala discendente

    // Linee a zig-zag stretto
    [0, 1, 0, 1, 0], // Zig-zag alto
    [2, 1, 2, 1, 2], // Zig-zag basso

    // Linee miste
    [1, 0, 1, 2, 1], // Centrale a onda
    [1, 2, 1, 0, 1], // Centrale a onda inversa
    [0, 2, 1, 0, 2], // Diagonale alternata
    [2, 0, 1, 2, 0], // Diagonale alternata inversa

    // Linee a zig-zag ampio
    [0, 2, 0, 2, 0], // Zig-zag ampio alto
    [2, 0, 2, 0, 2], // Zig-zag ampio basso

    // Linee combinate
    [0, 1, 1, 1, 0], // A cornice alta
    [2, 1, 1, 1, 2], // A cornice bassa
    [1, 0, 0, 0, 1], // Cornice inversa alta
    [1, 2, 2, 2, 1]  // Cornice inversa bassa
  ];

  // Metodo per far girare i rulli
  spin() {
    if (this.isSpinning) return;

    if (this.balance <= 0) {
      this.result = 'Saldo insufficiente!';
      return;
    }

    this.isSpinning = true;
    this.result = '';
    this.winningLines = [];
    this.balance -= 1; // Costo dello spin

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
      }
    }, 100);
  }

  // Ottieni un simbolo casuale in base alla distribuzione ponderata
  getRandomSymbol(): SlotSymbol {
    const index = Math.floor(Math.random() * this.symbols.length);
    return this.symbols[index];
  }

  // Controlla le linee vincenti
  // Metodo aggiornato per controllare il risultato
  checkResult() {
    console.log('Simboli sui rulli:', this.reels);

    this.payLines.forEach((line, index) => {
      const symbolsInLine = line.map((row, col) => this.reels[col][row]);
      console.log(`Linea ${index + 1}:`, symbolsInLine);

      // Conta i simboli consecutivi uguali
      let currentSymbol = symbolsInLine[0];
      let count = 1;

      for (let i = 1; i < symbolsInLine.length; i++) {
        if (symbolsInLine[i] === currentSymbol) {
          count++;
          if (count >= 3) { // Linea vincente con almeno 3 simboli uguali
            this.addWinningLine(`Linea ${index + 1} con ${count} ${currentSymbol}`, currentSymbol);
            break; // Una volta trovata una vincita, interrompi
          }
        } else {
          currentSymbol = symbolsInLine[i];
          count = 1;
        }
      }
    });

    this.result = this.winningLines.length > 0 ? 'Hai vinto!' : 'Prova ancora!';
  }


// Metodo aggiornato per aggiungere una linea vincente
addWinningLine(line: string, symbol: SlotSymbol) {
  const basePayment = this.linePayments[symbol] || 0;
  const totalPayment = basePayment * 3; // Moltiplica il pagamento base per 3 (o più se necessario)

  console.log(`Linea vincente trovata: ${line} con simbolo ${symbol}, paga ${totalPayment}€`);
  this.balance += totalPayment;
  this.winningLines.push(`${line} paga ${totalPayment}€`);
}



// Metodo di debug per visualizzare lo stato dei rulli
logReelsState() {
  console.log('Stato dei rulli:');
  this.reels.forEach((reel, index) => {
    console.log(`Rullo ${index + 1}: ${reel.join(' | ')}`);
  });
}


}
