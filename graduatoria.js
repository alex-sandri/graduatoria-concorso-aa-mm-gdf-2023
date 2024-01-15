import fs from 'fs/promises';

import preselezione from './preselezione.json' assert { type: 'json' };
import culturaGenerale from './cultura_generale.json' assert { type: 'json' };
import graduatoriaFinale from './graduatoria_finale.json' assert { type: 'json' };

const config = { out: 'graduatoria_parziale.json' };

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

log(
  'info',
  'importati %i elementi da \'graduatoria_finale.json\'',
  graduatoriaFinale.length,
);

logLine();

const calcolaGraduatoriaParziale = () => {
  const graduatoria = {};

  for (const [id, punteggioCulturaGenerale] of culturaGenerale) {
    const [, punteggioPreselezione] = preselezione
      .find(esito => esito[0] === id);

    const elementoGraduatoriaFinale = graduatoriaFinale
      .find(esito => esito[0] === id);

    const punteggio = punteggioPreselezione + punteggioCulturaGenerale;

    let incrementoPostCulturaGenerale = 'N/A';

    if (elementoGraduatoriaFinale !== undefined) {
      incrementoPostCulturaGenerale = elementoGraduatoriaFinale[1] - punteggio;

      // Show just two decimal places, this should at least hide float precision issues
      incrementoPostCulturaGenerale = parseFloat(incrementoPostCulturaGenerale.toFixed(2));
    }

    graduatoria[id] = { punteggio, incrementoPostCulturaGenerale };
  }

  return Object
    .fromEntries(Object.entries(graduatoria)
    .sort(([, a], [, b]) => b.punteggio - a.punteggio));
}

const graduatoria = calcolaGraduatoriaParziale();

log(
  'info',
  'la graduatoria parziale ha %i elementi',
  Object.entries(graduatoria).length,
);

await fs.writeFile(
  `./${config.out}`,
  JSON.stringify(graduatoria, undefined, 4),
  'utf-8',
);

log('info', `graduatoria parziale salvata in '${config.out}'`);
