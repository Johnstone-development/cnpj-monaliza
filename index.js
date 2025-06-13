const cnpj = "30721151000108";
const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
const cacheKey = `dadosCNPJ_${cnpj}`;
const cacheExpiryHours = 24; // 24 horas de validade do cache

let dadosEmpresa = {};

// Função para carregar dados do cache, se válido
function carregarCache() {
  const cacheStr = localStorage.getItem(cacheKey);
  if (!cacheStr) return null;

  try {
    const cacheObj = JSON.parse(cacheStr);
    const agora = new Date();
    const validade = new Date(cacheObj.validade);

    if (validade > agora) {
      return cacheObj.dados;
    } else {
      localStorage.removeItem(cacheKey);
      return null;
    }
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
}

// Função para salvar dados no cache com validade
function salvarCache(dados) {
  const agora = new Date();
  const validade = new Date(agora.getTime() + cacheExpiryHours * 60 * 60 * 1000); // adiciona horas

  const cacheObj = {
    dados,
    validade: validade.toISOString(),
  };

  localStorage.setItem(cacheKey, JSON.stringify(cacheObj));
}

// Função para exibir dados na tela
function mostrarDados(data) {
  const result = document.getElementById("result");
  result.innerHTML = `
    <div class="info"><div class="label">Razão Social:</div><div class="value">${data.razao_social}</div></div>
    <div class="info"><div class="label">Nome Fantasia:</div><div class="value">${data.nome_fantasia}</div></div>
    <div class="info"><div class="label">CNPJ:</div><div class="value">${data.cnpj}</div></div>
    <div class="info"><div class="label">Situação:</div><div class="value">${data.descricao_situacao_cadastral}</div></div>
    <div class="info"><div class="label">Abertura:</div><div class="value">${data.data_inicio_atividade}</div></div>
    <div class="info"><div class="label">Natureza Jurídica:</div><div class="value">${data.natureza_juridica}</div></div>
    <div class="info"><div class="label">CNAE:</div><div class="value">${data.cnae_fiscal_descricao}</div></div>
    <div class="info"><div class="label">Logradouro:</div><div class="value">${data.logradouro}</div></div>
    <div class="info"><div class="label">Número:</div><div class="value">${data.numero}</div></div>
    <div class="info"><div class="label">Complemento:</div><div class="value">${data.complemento || '—'}</div></div>
    <div class="info"><div class="label">Bairro:</div><div class="value">${data.bairro}</div></div>
    <div class="info"><div class="label">Município:</div><div class="value">${data.municipio}</div></div>
    <div class="info"><div class="label">UF:</div><div class="value">${data.uf}</div></div>
    <div class="info"><div class="label">CEP:</div><div class="value">${data.cep}</div></div>
  `;
}

// Função principal para obter dados (cache ou fetch)
async function obterDadosCNPJ() {
  dadosEmpresa = carregarCache();
  if (dadosEmpresa) {
    mostrarDados(dadosEmpresa);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar o CNPJ");

    const data = await response.json();
    dadosEmpresa = data;
    salvarCache(dadosEmpresa);
    mostrarDados(dadosEmpresa);
  } catch (err) {
    document.getElementById("result").innerHTML = `<p style="color:red;text-align:center;">Erro: ${err.message}</p>`;
  }
}

// Chama a função ao carregar o script
obterDadosCNPJ();


// Gerar PDF com jsPDF (texto puro)
async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const leftMargin = 15;
  const rightMargin = 195; // largura útil da página (A4 ~210mm - margens)
  const maxLineWidth = rightMargin - leftMargin;
  const lineHeight = 10;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Consulta de CNPJ", 105, y, null, null, "center");
  y += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  function addField(label, value) {
    const labelX = leftMargin;
    const valueX = leftMargin + 60;

    doc.setFont(undefined, "bold");
    doc.text(label + ":", labelX, y);

    doc.setFont(undefined, "normal");

    const splitText = doc.splitTextToSize(value.toString(), maxLineWidth - 60);

    splitText.forEach((line, i) => {
      doc.text(line, valueX, y + i * lineHeight);
    });

    y += lineHeight * Math.max(splitText.length, 1);
  }

  if (!dadosEmpresa || !dadosEmpresa.cnpj) {
    alert("Dados do CNPJ não carregados ainda.");
    return;
  }

  addField("Razão Social", dadosEmpresa.razao_social);
  addField("Nome Fantasia", dadosEmpresa.nome_fantasia);
  addField("CNPJ", dadosEmpresa.cnpj);
  addField("Situação", dadosEmpresa.descricao_situacao_cadastral);
  addField("Data de Abertura", dadosEmpresa.data_inicio_atividade);
  addField("Natureza Jurídica", dadosEmpresa.natureza_juridica);
  addField("CNAE", dadosEmpresa.cnae_fiscal_descricao);
  addField("Logradouro", dadosEmpresa.logradouro);
  addField("Número", dadosEmpresa.numero);
  addField("Complemento", dadosEmpresa.complemento || "—");
  addField("Bairro", dadosEmpresa.bairro);
  addField("Município", dadosEmpresa.municipio);
  addField("UF", dadosEmpresa.uf);
  addField("CEP", dadosEmpresa.cep);

  doc.save("dados_cnpj.pdf");
}

// Compartilhar no WhatsApp
function compartilharWhatsApp() {
  if (!dadosEmpresa || !dadosEmpresa.cnpj) {
    alert("Dados do CNPJ não carregados ainda.");
    return;
  }
  const texto = `
Consulta CNPJ:
Razão Social: ${dadosEmpresa.razao_social}
Nome Fantasia: ${dadosEmpresa.nome_fantasia}
CNPJ: ${dadosEmpresa.cnpj}
Situação: ${dadosEmpresa.descricao_situacao_cadastral}
Abertura: ${dadosEmpresa.data_inicio_atividade}
Natureza Jurídica: ${dadosEmpresa.natureza_juridica}
CNAE: ${dadosEmpresa.cnae_fiscal_descricao}
Endereço: ${dadosEmpresa.logradouro}, ${dadosEmpresa.numero}, ${dadosEmpresa.bairro}, ${dadosEmpresa.municipio} - ${dadosEmpresa.uf}, CEP: ${dadosEmpresa.cep}
  `.trim();

  const link = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(link, "_blank");
}
