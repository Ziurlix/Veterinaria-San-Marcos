export const services = [
  {
    id: 'vacunacion',
    icon: '💉',
    title: 'Vacunación',
    description: 'Antirrábica, séxtuple, triple felina y refuerzos anuales.',
    duration: '~10 Minutos',
    price: 'Desde $12.000 CLP'
  },
  {
    id: 'cirugia',
    icon: '⚕️',
    title: 'Cirugía',
    description: 'Esterilizaciones, cesáreas y cirugías menores con anestesia.',
    duration: '~45 - 90 Minutos',
    price: 'Desde $50.000 CLP'
  },
  {
    id: 'desparasitacion',
    icon: '🪱',
    title: 'Desparasitación',
    description: 'Tratamientos internos según peso y antiparasitario externo (pipeta).',
    duration: '~5 Minutos',
    price: 'Desde $7.500 CLP'
  },
  {
    id: 'examenes',
    icon: '🔬',
    title: 'Exámenes clínicos',
    description: 'Hemogramas, perfil bioquímico, radiografías y ecografías.',
    duration: '20 - 30 Minutos',
    price: 'Desde $18.000 CLP'
  },
  {
    id: 'procedimientos',
    icon: '✂️',
    title: 'Procedimientos y Cuidados',
    description: 'Corte de uñas, microchip con registro, limpieza dental y hospitalización.',
    duration: 'Variable',
    price: 'Desde $5.000 CLP'
  }
];

export const appointmentOptions = [
  { group: 'Vacunación', options: [
    ['Vacuna antirrábica ($12.000)', 'Vacuna antirrábica - $12.000'],
    ['Vacuna séxtuple canina ($18.000)', 'Vacuna séxtuple canina - $18.000'],
    ['Vacuna bivalente felina ($15.000)', 'Vacuna bivalente felina - $15.000'],
    ['Vacuna triple felina ($17.000)', 'Vacuna triple felina - $17.000'],
    ['Vacuna Bordetella ($14.000)', 'Vacuna Bordetella - $14.000']
  ]},
  { group: 'Cirugías', options: [
    ['Esterilización canina ($60.000 - $80.000)', 'Esterilización canina - Desde $60.000'],
    ['Esterilización felina ($50.000 - $65.000)', 'Esterilización felina - Desde $50.000'],
    ['Extirpación tumor cutáneo ($120.000)', 'Extirpación tumor - $120.000'],
    ['Cesárea de urgencia ($180.000)', 'Cesárea de urgencia - $180.000']
  ]},
  { group: 'Desparasitación', options: [
    ['Desparasitación interna ($8.000 - $11.000)', 'Desparasitación interna - Desde $8.000'],
    ['Antiparasitario externo pipeta ($7.500)', 'Antiparasitario externo (pipeta) - $7.500']
  ]},
  { group: 'Exámenes', options: [
    ['Hemograma completo ($22.000)', 'Hemograma completo - $22.000'],
    ['Perfil bioquímico ($35.000)', 'Perfil bioquímico - $35.000'],
    ['Radiografía ($28.000)', 'Radiografía - $28.000'],
    ['Ecografía abdominal ($45.000)', 'Ecografía abdominal - $45.000'],
    ['Test de leishmaniasis ($18.000)', 'Test de leishmaniasis - $18.000']
  ]},
  { group: 'Otros', options: [
    ['Corte de uñas ($5.000)', 'Corte de uñas - $5.000'],
    ['Limpieza dental ($55.000)', 'Limpieza dental - $55.000'],
    ['Microchip de identificación ($15.000)', 'Microchip de identificación - $15.000'],
    ['Hospitalización por día ($30.000)', 'Hospitalización (día) - $30.000']
  ]}
];

export const categoryToFirstOption = {
  'Vacunación': appointmentOptions[0].options[0][0],
  'Cirugía': appointmentOptions[1].options[0][0],
  'Desparasitación': appointmentOptions[2].options[0][0],
  'Exámenes clínicos': appointmentOptions[3].options[0][0],
  'Procedimientos y Cuidados': appointmentOptions[4].options[0][0]
};

export const todayAsLocalDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
