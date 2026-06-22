export interface PricingInputs {
  pesoPecaGrams: number;
  taxaPerdaSuportesPercent: number;
  custoRoloFilamentoBRL: number; // por bobina de 1kg
  consumoWattsMaquina: number;
  tempoImpressaoHoras: number;
  custoKwhBRL: number;
  valorMaquinaBRL: number;
  tempoVidaUtilHoras: number;
  totalAcumuladoInsumosFisicosUsadosBRL: number;
  tempoAcabamentoPosProcessamentoHoras: number;
  valorSuaHoraTrabalhoBRL: number;
  margemLucroDesejadoPercent: number;
  tarifaFixaMarketplaceBRL: number;
  comissaoMarketplacePercent: number;
}

export interface PricingResult {
  custoFilamento: number;
  custoEnergia: number;
  depreciacaoMaquina: number;
  custoInsumosEmbalagem: number;
  custoMaoDeObra: number;
  custoProducaoTotal: number;
  precoVendaParcial: number;
  precoVendaFinal: number;
}

export function calcularPreco(i: PricingInputs): PricingResult {
  const custoFilamento =
    i.pesoPecaGrams * (1 + i.taxaPerdaSuportesPercent / 100) * (i.custoRoloFilamentoBRL / 1000);
  const custoEnergia = (i.consumoWattsMaquina / 1000) * i.tempoImpressaoHoras * i.custoKwhBRL;
  const depreciacaoMaquina =
    i.tempoVidaUtilHoras > 0 ? (i.valorMaquinaBRL / i.tempoVidaUtilHoras) * i.tempoImpressaoHoras : 0;
  const custoInsumosEmbalagem = i.totalAcumuladoInsumosFisicosUsadosBRL;
  const custoMaoDeObra = i.tempoAcabamentoPosProcessamentoHoras * i.valorSuaHoraTrabalhoBRL;
  const custoProducaoTotal =
    custoFilamento + custoEnergia + depreciacaoMaquina + custoInsumosEmbalagem + custoMaoDeObra;
  const precoVendaParcial = custoProducaoTotal * (1 + i.margemLucroDesejadoPercent / 100);
  const denom = 1 - i.comissaoMarketplacePercent / 100;
  const precoVendaFinal =
    denom > 0 ? (precoVendaParcial + i.tarifaFixaMarketplaceBRL) / denom : precoVendaParcial + i.tarifaFixaMarketplaceBRL;
  return {
    custoFilamento,
    custoEnergia,
    depreciacaoMaquina,
    custoInsumosEmbalagem,
    custoMaoDeObra,
    custoProducaoTotal,
    precoVendaParcial,
    precoVendaFinal,
  };
}