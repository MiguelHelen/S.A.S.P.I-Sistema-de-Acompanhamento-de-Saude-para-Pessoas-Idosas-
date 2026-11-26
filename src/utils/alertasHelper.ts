export interface AlertaItem {
  id: string;
  categoria: 'Saúde' | 'Medicamentos' | 'Consultas';
  nivel: 'CRITICO' | 'AVISO' | 'INFO';
  prioridade: 'ALTA' | 'NORMAL';
  titulo: string;
  descricao: string;
  destino: string;
}

export function parseDataConsulta(c: any): Date | null {
  if (c?.data_hora) {
    const dt = new Date(c.data_hora);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const raw = c?.data_consulta || c?.data;
  if (!raw) return null;

  const str = String(raw).trim();
  const matchIsoDate = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIsoDate) {
    const ano = Number(matchIsoDate[1]);
    const mes = Number(matchIsoDate[2]) - 1;
    const dia = Number(matchIsoDate[3]);
    const matchHora = String(c?.horario || '').match(/^(\d{1,2}):(\d{2})/);
    const hora = matchHora ? Number(matchHora[1]) : 23;
    const min = matchHora ? Number(matchHora[2]) : 59;
    return new Date(ano, mes, dia, hora, min, 0);
  }

  const dt = new Date(str);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatarDataHoraConsulta(c: any): { data: string; hora: string } {
  if (c?.data_hora) {
    const dt = new Date(c.data_hora);
    if (!Number.isNaN(dt.getTime())) {
      return {
        data: dt.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        hora: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  const dt = parseDataConsulta(c);
  if (dt) {
    return {
      data: dt.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      hora: c?.horario || '',
    };
  }

  return {
    data: c?.data || 'Data a confirmar',
    hora: c?.horario || '',
  };
}

export function gerarAlertasClinicos(
  registros: any[],
  prescricoes: any[],
  consultas: any[]
): AlertaItem[] {
  const lista: AlertaItem[] = [];

  registros.forEach((reg: any) => {
    const nomeInd = String(
      reg.indicador?.nome || reg.indicador_saude?.nome || reg.nome_indicador || ''
    ).toLowerCase();
    const valorNum = Number(reg.valor_numerico);
    const valorCat = String(reg.valor_categorico || '');
    const horario = reg.data_hora
      ? new Date(reg.data_hora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    if (nomeInd.includes('press') || nomeInd.includes('pa')) {
      const matchPa = valorCat.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (matchPa) {
        const sist = Number(matchPa[1]);
        const diast = Number(matchPa[2]);
        if (sist >= 140 || diast >= 90) {
          lista.push({
            id: `pa_alta_${reg.id}`,
            categoria: 'Saúde',
            nivel: 'CRITICO',
            prioridade: 'ALTA',
            titulo: 'Pressão arterial elevada',
            descricao: `PA: ${valorCat} mmHg às ${horario}. Atenção para hipertensão.`,
            destino: 'Saúde',
          });
        } else if (sist < 90 || diast < 60) {
          lista.push({
            id: `pa_baixa_${reg.id}`,
            categoria: 'Saúde',
            nivel: 'AVISO',
            prioridade: 'ALTA',
            titulo: 'Pressão arterial baixa',
            descricao: `PA: ${valorCat} mmHg às ${horario}. Monitore sintomas de tontura.`,
            destino: 'Saúde',
          });
        }
      }
    } else if (reg.valor_numerico != null && !Number.isNaN(valorNum)) {
      if (nomeInd.includes('card') && valorNum > 100) {
        lista.push({
          id: `fc_alta_${reg.id}`,
          categoria: 'Saúde',
          nivel: 'CRITICO',
          prioridade: 'ALTA',
          titulo: 'Frequência cardíaca elevada',
          descricao: `FC: ${valorNum} bpm às ${horario}. Verifique o estado da pessoa acompanhada.`,
          destino: 'Saúde',
        });
      } else if (nomeInd.includes('card') && valorNum < 60) {
        lista.push({
          id: `fc_baixa_${reg.id}`,
          categoria: 'Saúde',
          nivel: 'CRITICO',
          prioridade: 'ALTA',
          titulo: 'Frequência cardíaca baixa',
          descricao: `FC: ${valorNum} bpm às ${horario}. Considere avaliação profissional.`,
          destino: 'Saúde',
        });
      } else if ((nomeInd.includes('oxig') || nomeInd.includes('spo')) && valorNum < 95) {
        lista.push({
          id: `spo2_${reg.id}`,
          categoria: 'Saúde',
          nivel: 'CRITICO',
          prioridade: 'ALTA',
          titulo: 'Oxigenação abaixo do normal',
          descricao: `SpO₂: ${valorNum}% às ${horario}. Atenção para possível quadro de hipóxia.`,
          destino: 'Saúde',
        });
      } else if (nomeInd.includes('temp') && valorNum >= 37.3) {
        lista.push({
          id: `temp_${reg.id}`,
          categoria: 'Saúde',
          nivel: 'AVISO',
          prioridade: 'ALTA',
          titulo: 'Estado febril detectado',
          descricao: `Temperatura: ${valorNum}°C às ${horario}. Monitore a evolução.`,
          destino: 'Saúde',
        });
      }
    }
  });

  const ativas = prescricoes.filter(
    (m: any) => (m.status || 'ATIVA').toUpperCase() === 'ATIVA'
  );
  ativas.slice(0, 3).forEach((m: any) => {
    lista.push({
      id: `med_${m.id}`,
      categoria: 'Medicamentos',
      nivel: 'AVISO',
      prioridade: 'ALTA',
      titulo: 'Dose de medicamento ativa',
      descricao: `${m.medicamento?.nome || 'Medicamento'} ${m.dosagem || ''} • ${m.frequencia || 'Uso contínuo'}`,
      destino: 'Remédios',
    });
  });

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const agendadas = consultas.filter((c: any) => {
    const st = (c.status || 'AGENDADA').toUpperCase();
    if (st !== 'AGENDADA' && st !== 'CONFIRMADA') return false;
    const dt = parseDataConsulta(c);
    return dt !== null && dt >= inicioHoje;
  });

  agendadas.slice(0, 3).forEach((c: any) => {
    const { data, hora } = formatarDataHoraConsulta(c);
    const quando = hora ? `${data} às ${hora}` : data;
    lista.push({
      id: `cons_${c.id}`,
      categoria: 'Consultas',
      nivel: 'INFO',
      prioridade: 'NORMAL',
      titulo: 'Consulta próxima',
      descricao: [c.especialidade || 'Consulta Médica', quando].filter(Boolean).join(' • '),
      destino: 'Agenda',
    });
  });

  return lista;
}