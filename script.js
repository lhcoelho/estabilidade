//declaração de variáveis
var fck;
var fyk;
var b;
var d;
var d1;
var lambda;
var alphaC;
var ecu;
var Rsc;
var Rst;
var Rcc;
var x;
var y;
var xLim2;
var xLim3;
var kxLim2;
var kxLim3;
var eyd;
var as;
var as1;

function dimensionar() {
  var resultado = document.getElementById("resultado");
  resultado.innerHTML =
    "</br> &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp </br>" +
    "&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp";
  entradaDeDados();
  if (isNaN(b) || isNaN(d) || isNaN(d1)) {
    var resultado = document.getElementById("resultado");
    resultado.innerHTML =
      "</br>Digite todos os dados geométricos da seção </br>";
  } else {
    calculosPreliminares();
    calculoDoMomento();
  }
}
function entradaDeDados() {
  var classeConcreto = document.getElementById("concreto");
  //fck em MPa
  fck = parseFloat(classeConcreto.value);
  //fyk em MPa
  var tipoDeAco = document.getElementById("aco");
  fyk = parseFloat(tipoDeAco.value);
  // b, d e d' (d1) em m
  var largura = document.getElementById("b");
  b = parseFloat(largura.value.replace(",", ".")) / 100;

  var altura = document.getElementById("d");
  d = parseFloat(altura.value.replace(",", ".")) / 100;

  var dLinha = document.getElementById("d1");
  d1 = parseFloat(dLinha.value.replace(",", ".")) / 100;

  //áreas de aço em m²
  var aTracao = document.getElementById("As");
  as = parseFloat(aTracao.value.replace(",", ".")) / 10000;
  if (isNaN(as)) {
    as = 0;
  }
  var aCompr = document.getElementById("As1");
  as1 = parseFloat(aCompr.value.replace(",", ".")) / 10000;
  if (isNaN(as1)) {
    as1 = 0;
  }
}

function calculosPreliminares() {
  // lambda e alphaC [adimensional], ecu e eyd [por mil]
  //
  lambda = 0.8;
  alphaC = 0.85;
  ecu = 3.5;
  if (fck > 50) {
    lambda = 0.8 - (fck - 50) / 400;
    alphaC = 0.85 * (1 - (fck - 50) / 200);
    ecu = 2.6 + 35 * Math.pow((90 - fck) / 100, 4);
  }
  eyd = fyk / 1.15 / 210;
  kxLim2 = ecu / (ecu + 10);
  kxLim3 = ecu / (ecu + eyd);
}

function calculoDoMomento() {
  var kxInf = 0;
  var kxSup = 1;
  while (kxSup - kxInf > 0.00001) {
    var kx = (kxInf + kxSup) / 2;
    Rcc = (alphaC * lambda * kx * b * d * fck) / 1.4;
    if (kx <= kxLim2) {
      var dominio = "2";
      var esc = ((kx - d1 / d) / (1 - kx)) * 10;
      if (esc >= eyd) {
        Rsc = (as1 * fyk) / 1.15;
      } else {
        Rsc = as1 * esc * 210;
      }
      Rst = (as * fyk) / 1.15;
    } else if (kx >= kxLim3) {
      var dominio = "4";
      var esd = ((1 - kx) / kx) * ecu;
      var esc = ((kx - d1 / d) / kx) * ecu;
      if (esc >= eyd) {
        Rsc = (as1 * fyk) / 1.15;
      } else {
        Rsc = as1 * esc * 210;
      }
      if (esd >= eyd) {
        Rst = (as * fyk) / 1.15;
      } else {
        Rst = as * esd * 210;
      }
    } else {
      var dominio = "3";
      Rst = (as * fyk) / 1.15;
      esc = ((kx - d1 / d) / kx) * ecu;
      if (esc >= eyd) {
        Rsc = (as1 * fyk) / 1.15;
      } else {
        Rsc = as1 * esc * 210;
      }
    }
    // verificação do equilibrio
    if (Rcc + Rsc > Rst) {
      kxSup = kx;
    } else {
      kxInf = kx;
    }
  }
  var Mk = (Rcc * (1 - (lambda * kx) / 2) * d + Rsc * (d - d1)) / 1.4;
  var resultado = document.getElementById("resultado");
  resultado.innerHTML =
    "</br> <h2> Resultados </h2>" +
    "<b>Mk= " +
    (Mk * 1000).toFixed(2).toString().replace(".", ",") +
    "kN.m" +
    "</br>Domínio " +
    dominio;
}