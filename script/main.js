document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleDarkMode');
  const body = document.body;
  const form = document.getElementById('salaryForm');
  const resultDiv = document.getElementById('result');

  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    toggleBtn.setAttribute(
      'aria-pressed',
      body.classList.contains('dark-mode') ? 'true' : 'false'
    );
    toggleBtn.textContent = body.classList.contains('dark-mode') ? 'Modo Claro' : 'Modo Oscuro';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const salarioBrutoAnual = parseFloat(form.salarioBruto.value);
    if (isNaN(salarioBrutoAnual) || salarioBrutoAnual <= 0) {
      mostrarResultado('Introduce un salario bruto anual válido.');
      return;
    }


    const pagasProrrateadas = form.pagas.value === 'si';
    const mesesPago = pagasProrrateadas ? 12 : 14;

   
    let salarioBrutoMensual = salarioBrutoAnual / mesesPago;

    const contrato = form.contrato.value;
    const jornada = form.jornada.value;
    const edad = form.edad.value;
    const estadoCivil = form.estadoCivil.value;
    const numHijos = parseInt(form.numHijos.value) || 0;
    const plusTransporte = parseFloat(form.plusTransporte.value) || 0;
    const plusAntiguedad = parseFloat(form.plusAntiguedad.value) || 0;

    salarioBrutoMensual += plusTransporte + plusAntiguedad;

    if (jornada === 'parcial') {
      salarioBrutoMensual *= 0.5;
    }

    const cotizacionSS = salarioBrutoMensual * 0.0635;

    //me arrepiento de haber dicho que me estaba resultando sencillo
    
    const baseIRPF = salarioBrutoMensual - cotizacionSS;

    const tramos = [
      { limite: 12450 / 12, tipo: 0.19 },
      { limite: 20200 / 12, tipo: 0.24 },
      { limite: 35200 / 12, tipo: 0.30 },
      { limite: 60000 / 12, tipo: 0.37 },
      { limite: Infinity, tipo: 0.45 }
    ];

    let modEdad = 0;
    if (edad === 'menos25') modEdad = -0.02;

    let modCivil = 0;
    if (estadoCivil === 'casado') modCivil = -0.015;

    const modHijos = -0.01 * numHijos;

    let irpfTotal = 0;
    let limiteAnterior = 0;
    for (const tramo of tramos) {
      if (baseIRPF > limiteAnterior) {
        const tramoBase = Math.min(baseIRPF, tramo.limite) - limiteAnterior;
        irpfTotal += tramoBase * tramo.tipo;
        limiteAnterior = tramo.limite;
      } else {
        break;
      }
    }

    let modTotal = 1 + modEdad + modCivil + modHijos;
    if (modTotal < 0.5) modTotal = 0.5; 

    irpfTotal *= modTotal;

    const salarioNetoMensual = baseIRPF - irpfTotal;

    mostrarResultado(`Salario neto mensual aproximado: <strong>€${salarioNetoMensual.toFixed(2)}</strong>`);
  });

  function mostrarResultado(mensaje) {
    resultDiv.innerHTML = mensaje;
    resultDiv.classList.add('show');
  }
});

 //odio con todo mi ser a hacienda, no me gusta pagar impuestos, no se que hago haciendo una calculadora de impuestos
 // pero bueno, espero que esto sirva para algo