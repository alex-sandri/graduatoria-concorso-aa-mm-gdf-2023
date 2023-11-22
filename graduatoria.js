import fs from 'fs/promises';

import preselezione from './preselezione.json' assert { type: 'json' };
import culturaGenerale from './cultura_generale.json' assert { type: 'json' };

const me = {
  id: '2023AAMM3856V1',
  punteggi: {
    fisiche: 0.2,
    orale: 10,
    lingua: 0, // TODO
    totale: function () { return this.fisiche + this.orale + this.lingua; }
  },
};

const log = (etichetta, contenuto, ...parametri) =>
  console.info(`[${etichetta}] ${contenuto}`, ...parametri);

const logLine = () => console.log('');

log(
  'info',
  'importati %i elementi da \'preselezione.json\'',
  preselezione.length,
);

log(
  'info',
  'importati %i elementi da \'cultura_generale.json\'',
  culturaGenerale.length,
);

logLine();

const calcolaGraduatoria = ({ incrementaleMio, incrementaleAltri } = {}) => {
  const graduatoria = {};

  incrementaleMio ??= 0;
  incrementaleAltri ??= 0;

  for (const [id, punteggioCulturaGenerale] of culturaGenerale) {
    const [, punteggioPreselezione] = preselezione
      .find(esito => esito[0] === id);

    let punteggio = punteggioPreselezione + punteggioCulturaGenerale;
    punteggio += id === me.id ? incrementaleMio : incrementaleAltri;

    graduatoria[id] = punteggio;
  }

  return Object
    .fromEntries(Object.entries(graduatoria)
    .sort(([, a], [, b]) => b - a));
}

const ottieniPosizione = (graduatoria, id) =>
  // Non esiste la posizione '0'.
  Object.entries(graduatoria).findIndex(candidato => candidato[0] === id) + 1;

const stampaGraduatoria = (graduatoria, etichetta) => {
  const mioPunteggio = graduatoria[me.id];

  const intervalloStessoPunteggio = Object.entries(graduatoria)
    .filter(([, punteggio]) => punteggio === mioPunteggio)
    .map(([id]) => ottieniPosizione(graduatoria, id));

  log(etichetta, 'punteggio: %f', mioPunteggio);

  log(
    etichetta,
    'posizione: tra %i e %i',
    intervalloStessoPunteggio[0],
    intervalloStessoPunteggio.at(-1),
  );
}

{
  const graduatoria = calcolaGraduatoria();

  log(
    'info',
    'la graduatoria ha %i elementi',
    Object.entries(graduatoria).length,
  );

  await fs.writeFile(
    './graduatoria.json',
    JSON.stringify(graduatoria, undefined, 4),
    'utf-8',
  );

  log('info', 'graduatoria salvata in \'graduatoria.json\'');
}

{
  const graduatoria = calcolaGraduatoria();

  logLine();
  stampaGraduatoria(graduatoria, 'attuale');
}

{
  const graduatoria = calcolaGraduatoria({
    incrementaleMio: me.punteggi.totale(),
    incrementaleAltri: 0.4 + 10 + 0.1, // massimo fisiche + orale + lingua.
  });

  logLine();
  stampaGraduatoria(graduatoria, 'caso-peggiore');
}
