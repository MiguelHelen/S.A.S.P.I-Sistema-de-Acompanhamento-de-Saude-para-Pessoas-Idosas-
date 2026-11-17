
package com.saspi.mobile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// 1. SPLASH SCREEN

@Composable
fun SplashScreen(onContinue: () -> Unit = {}) {
    SaspiPage {
        Spacer(modifier = Modifier.weight(1f))

        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(30.dp),
                color = SaspiColors.lightTeal,
                modifier = Modifier.size(120.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text("♥", fontSize = 65.sp, color = SaspiColors.teal)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                "S.A.S.P.I.",
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                color = SaspiColors.blue
            )

            Text(
                "Sistema de Acompanhamento de\nSaúde para Pessoas Idosas",
                fontSize = 14.sp,
                color = SaspiColors.gray,
                textAlign = TextAlign.Center
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        SaspiButton(
            text = "Começar",
            onClick = onContinue
        )

        Spacer(modifier = Modifier.height(25.dp))
    }
}

// 2. CADASTRO / REGISTRO

@Composable
fun RegisterScreen(
    onBackClick: () -> Unit = {},
    onRegisterClick: () -> Unit = {}
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var profile by remember { mutableStateOf("Idoso") }

    SaspiPage {
        SaspiHeader("Criar conta", onBackClick)

        Text(
            "Vamos começar!",
            fontSize = 25.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Preencha seus dados para acessar o S.A.S.P.I.",
            color = SaspiColors.gray,
            fontSize = 14.sp,
            modifier = Modifier.padding(top = 5.dp, bottom = 20.dp)
        )

        SaspiSectionTitle("Dados pessoais")

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nome completo") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("E-mail") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Senha") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            shape = RoundedCornerShape(13.dp)
        )

        SaspiSectionTitle("Tipo de perfil")

        listOf("Idoso", "Familiar", "Cuidador").forEach { option ->
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(
                    selected = profile == option,
                    onClick = { profile = option },
                    colors = RadioButtonDefaults.colors(
                        selectedColor = SaspiColors.teal
                    )
                )
                Text(option, color = SaspiColors.dark)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        SaspiButton(
            text = "Criar conta",
            onClick = onRegisterClick
        )
    }
}

// 3. DASHBOARD DO CUIDADOR

@Composable
fun CaregiverDashboardScreen(
    onBackClick: () -> Unit = {},
    onSelectElderly: () -> Unit = {},
    onSOSClick: () -> Unit = {},
    onHelpClick: () -> Unit = {}
) {
    SaspiPage {
        SaspiHeader("Painel do cuidador", onBackClick)

        Text(
            "Olá, cuidador(a)!",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Acompanhe a rotina e os cuidados dos idosos vinculados.",
            color = SaspiColors.gray,
            fontSize = 13.sp
        )

        SaspiSectionTitle("Resumo geral")

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            SaspiCard(modifier = Modifier.weight(1f)) {
                Text("02", fontSize = 27.sp, color = SaspiColors.blue, fontWeight = FontWeight.Bold)
                Text("Idosos", color = SaspiColors.gray, fontSize = 12.sp)
            }

            SaspiCard(modifier = Modifier.weight(1f)) {
                Text("01", fontSize = 27.sp, color = SaspiColors.teal, fontWeight = FontWeight.Bold)
                Text("Atenção", color = SaspiColors.gray, fontSize = 12.sp)
            }
        }

        SaspiSectionTitle("Idosos acompanhados")

        SaspiCard {
            Text("Maria Oliveira", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Último registro: hoje às 08:00", color = SaspiColors.gray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(8.dp))
            SaspiStatus("Rotina em dia", SaspiColors.teal, SaspiColors.lightTeal)
            Spacer(modifier = Modifier.height(12.dp))
            SaspiOutlinedButton("Ver acompanhamento", onSelectElderly)
        }

        SaspiCard {
            Text("João Santos", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Possui uma medicação pendente", color = SaspiColors.gray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(8.dp))
            SaspiStatus("Verificar rotina", SaspiColors.orange, SaspiColors.lightOrange)
            Spacer(modifier = Modifier.height(12.dp))
            SaspiOutlinedButton("Ver acompanhamento", onSelectElderly)
        }

        SaspiSectionTitle("Acesso rápido")

        SaspiButton("Contato de emergência / SOS", onSOSClick)
        Spacer(modifier = Modifier.height(10.dp))
        SaspiOutlinedButton("Ajuda e suporte", onHelpClick)
    }
}

// 4. SELEÇÃO DE IDOSO

@Composable
fun SelectElderlyScreen(
    onBackClick: () -> Unit = {},
    onElderSelected: (String) -> Unit = {}
) {
    SaspiPage {
        SaspiHeader("Selecionar idoso", onBackClick)

        Text(
            "Quem você deseja acompanhar?",
            fontSize = 23.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Selecione uma pessoa para visualizar suas informações.",
            color = SaspiColors.gray,
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 5.dp, bottom = 20.dp)
        )

        listOf(
            "Maria Oliveira" to "Rotina em dia",
            "João Santos" to "Possui uma medicação pendente"
        ).forEach { (name, status) ->
            SaspiCard {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(50.dp),
                        color = SaspiColors.lightBlue,
                        modifier = Modifier.size(52.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("●", color = SaspiColors.blue, fontSize = 25.sp)
                        }
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(name, fontWeight = FontWeight.Bold, color = SaspiColors.dark)
                        Text(status, fontSize = 12.sp, color = SaspiColors.gray)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                SaspiButton(
                    text = "Selecionar",
                    onClick = { onElderSelected(name) }
                )
            }
        }
    }
}

// 5. ADICIONAR / EDITAR MEDICAMENTO

@Composable
fun AddEditMedicationScreen(
    onBackClick: () -> Unit = {},
    onSaveClick: () -> Unit = {}
) {
    var name by remember { mutableStateOf("") }
    var dosage by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var instructions by remember { mutableStateOf("") }

    SaspiPage {
        SaspiHeader("Adicionar medicamento", onBackClick)

        Text(
            "Dados do medicamento",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Preencha as informações conforme a orientação recebida.",
            fontSize = 13.sp,
            color = SaspiColors.gray,
            modifier = Modifier.padding(top = 5.dp, bottom = 15.dp)
        )

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nome do medicamento") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = dosage,
            onValueChange = { dosage = it },
            label = { Text("Dosagem (ex.: 50 mg)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = time,
            onValueChange = { time = it },
            label = { Text("Horário (ex.: 08:00)") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = instructions,
            onValueChange = { instructions = it },
            label = { Text("Orientações adicionais") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        SaspiButton(
            text = "Salvar medicamento",
            onClick = onSaveClick
        )
    }
}

// 6. REGISTRO DE SINAIS VITAIS

@Composable
fun RegisterVitalsScreen(
    onBackClick: () -> Unit = {},
    onSaveClick: () -> Unit = {}
) {
    var pressure by remember { mutableStateOf("") }
    var glucose by remember { mutableStateOf("") }
    var heartRate by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    SaspiPage {
        SaspiHeader("Registrar sinais vitais", onBackClick)

        Text(
            "Nova medição",
            fontSize = 23.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Insira os valores da medição realizada.",
            color = SaspiColors.gray,
            fontSize = 13.sp,
            modifier = Modifier.padding(top = 5.dp, bottom = 15.dp)
        )

        OutlinedTextField(
            value = pressure,
            onValueChange = { pressure = it },
            label = { Text("Pressão arterial (ex.: 120/80)") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = glucose,
            onValueChange = { glucose = it },
            label = { Text("Glicemia (mg/dL)") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = heartRate,
            onValueChange = { heartRate = it },
            label = { Text("Batimentos cardíacos (bpm)") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            shape = RoundedCornerShape(13.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Observações") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            shape = RoundedCornerShape(13.dp)
        )

        Text(
            "Os registros são informativos e não substituem uma avaliação profissional.",
            fontSize = 11.sp,
            color = SaspiColors.gray,
            modifier = Modifier.padding(vertical = 15.dp)
        )

        SaspiButton("Salvar medição", onSaveClick)
    }
}

// 7. CONTATO DE EMERGÊNCIA / SOS

@Composable
fun EmergencyScreen(
    onBackClick: () -> Unit = {},
    onCallFamily: () -> Unit = {},
    onCallCaregiver: () -> Unit = {},
    onCallEmergencyService: () -> Unit = {}
) {
    SaspiPage {
        SaspiHeader("Emergência / SOS", onBackClick)

        Text(
            "Precisa de ajuda?",
            fontSize = 25.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Acesse rapidamente os contatos cadastrados.",
            fontSize = 14.sp,
            color = SaspiColors.gray,
            modifier = Modifier.padding(top = 5.dp, bottom = 20.dp)
        )

        SaspiCard {
            Text("Familiar", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Contato de confiança cadastrado", color = SaspiColors.gray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            SaspiButton("Ligar para familiar", onCallFamily)
        }

        SaspiCard {
            Text("Cuidador", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Profissional responsável pelo acompanhamento", color = SaspiColors.gray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            SaspiButton("Ligar para cuidador", onCallCaregiver)
        }

        SaspiCard {
            Text("Serviço de emergência", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Em uma emergência, procure atendimento imediato.", color = SaspiColors.gray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(12.dp))
            SaspiOutlinedButton("Contato de emergência", onCallEmergencyService)
        }

        Text(
            "Os contatos precisam estar configurados para que os botões realizem chamadas.",
            fontSize = 11.sp,
            color = SaspiColors.gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 12.dp)
        )
    }
}

// 8. AJUDA / SUPORTE

@Composable
fun HelpSupportScreen(onBackClick: () -> Unit = {}) {
    SaspiPage {
        SaspiHeader("Ajuda e suporte", onBackClick)

        Text(
            "Como podemos ajudar?",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = SaspiColors.dark
        )

        Text(
            "Confira algumas orientações para utilizar o S.A.S.P.I.",
            fontSize = 13.sp,
            color = SaspiColors.gray,
            modifier = Modifier.padding(top = 5.dp, bottom = 15.dp)
        )

        SaspiSectionTitle("Como usar o aplicativo")

        SaspiCard {
            Text("1. Acessar sua conta", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Entre com os dados de acesso fornecidos pela clínica.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiCard {
            Text("2. Consultar a rotina", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Confira os medicamentos, horários, consultas e exames cadastrados.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiCard {
            Text("3. Registrar informações", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Adicione medições de saúde para manter o histórico atualizado.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiCard {
            Text("4. Acessar os alertas", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Veja os avisos relacionados à rotina e ao acompanhamento.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiSectionTitle("Dúvidas frequentes")

        SaspiCard {
            Text("Esqueci minha senha", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Na tela de login, selecione a opção “Esqueci a senha”.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiCard {
            Text("Meus dados não aparecem", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Verifique sua conexão e confirme com a clínica se seu cadastro está vinculado corretamente.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiCard {
            Text("Preciso de atendimento", fontWeight = FontWeight.Bold, color = SaspiColors.dark)
            Text("Utilize a tela de contato de emergência para acessar os contatos cadastrados.", fontSize = 13.sp, color = SaspiColors.gray)
        }

        SaspiSectionTitle("Suporte")

        SaspiCard {
            Text("Entre em contato com a clínica responsável pelo seu cadastro para receber ajuda com o acesso e as informações do sistema.", fontSize = 13.sp, color = SaspiColors.gray)
        }
    }
}