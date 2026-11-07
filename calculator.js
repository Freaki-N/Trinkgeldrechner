function trinkgeldBerechnen({
    bewertung,
    basisTrinkgeldsatz,
    maximalTrinkgeldsatz,

    durchschnittspreisGetraenke,
    anzahlGetraenke,

    durchschnittspreisHauptspeisen,
    anzahlHauptspeisen,

    durchschnittspreisNachspeisenVorspeisen,
    anzahlNachspeisenVorspeisen,

    gesamtpreis
}) {
    // HIER IMPLEMENTIERE ICH SELBST DIE BERECHNUNGSLOGIK!

    console.log("Bewertung:", bewertung);
    console.log("Basis-Trinkgeldsatz:", basisTrinkgeldsatz);
    console.log("Maximal-Trinkgeldsatz:", maximalTrinkgeldsatz);    
    
    ersatzgesamtpreis = durchschnittspreisGetraenke * anzahlGetraenke + durchschnittspreisHauptspeisen * anzahlHauptspeisen + durchschnittspreisNachspeisenVorspeisen * anzahlNachspeisenVorspeisen;
    console.log("Ersatzgesamtpreis:", ersatzgesamtpreis);

    prozentualerBasistrinkgeldsatz = basisTrinkgeldsatz / 100;
    prozentualerMaximaltrinkgeldsatz = maximalTrinkgeldsatz / 100;

    maximalesAbsolutesTrinkgeld = prozentualerMaximaltrinkgeldsatz * gesamtpreis;
    absolutesTrinkgeld = prozentualerBasistrinkgeldsatz * ersatzgesamtpreis;

    console.log("Absolutes Trinkgeld:", absolutesTrinkgeld);
    console.log("Maximales absolutes Trinkgeld:", maximalesAbsolutesTrinkgeld);

    console.log("\n");

    return bewertung * Math.min(absolutesTrinkgeld, maximalesAbsolutesTrinkgeld);
}

function betragAufrunden(betrag, zahlungsart) {
    const schrittInCent = zahlungsart === "bar" ? 50 : 10;
    const betragInCent = Math.round(betrag * 100);

    return Math.ceil(betragInCent / schrittInCent)
        * schrittInCent / 100;
}
