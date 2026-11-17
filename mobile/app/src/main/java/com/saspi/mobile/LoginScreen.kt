
package com.saspi.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LoginScreen(
    onLoginClick: (String, String) -> Unit = { _, _ -> },
    onBiometricClick: () -> Unit = {},
    onForgotPasswordClick: () -> Unit = {},
    onRegisterClick: () -> Unit = {}
) {
    var email by remember { mutableStateOf("") }
    var senha by remember { mutableStateOf("") }
    var manterConectado by remember { mutableStateOf(false) }
    var mostrarSenha by remember { mutableStateOf(false) }

    val blue = Color(0xFF247BA0)
    val darkBlue = Color(0xFF185B7A)
    val teal = Color(0xFF38B6A4)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFE7F5F8),
                        Color.White
                    )
                )
            )
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        // Identidade visual do aplicativo
        Box(
            modifier = Modifier
                .size(82.dp)
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(blue, teal)
                    ),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "S",
                fontSize = 42.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "S.A.S.P.I.",
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            color = darkBlue
        )

        Text(
            text = "Sistema de Acompanhamento de Saúde",
            fontSize = 13.sp,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(28.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(
                defaultElevation = 4.dp
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(22.dp)
            ) {

                Text(
                    text = "Bem-vindo!",
                    fontSize = 25.sp,
                    fontWeight = FontWeight.Bold,
                    color = darkBlue
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Entre com seus dados para continuar.",
                    fontSize = 14.sp,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(22.dp))

                Text(
                    text = "E-mail ou CPF",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = darkBlue
                )

                Spacer(modifier = Modifier.height(7.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = {
                        Text("Digite seu e-mail ou CPF")
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Senha",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = darkBlue
                )

                Spacer(modifier = Modifier.height(7.dp))

                OutlinedTextField(
                    value = senha,
                    onValueChange = { senha = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = {
                        Text("Digite sua senha")
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    visualTransformation = if (mostrarSenha) {
                        VisualTransformation.None
                    } else {
                        PasswordVisualTransformation()
                    },
                    trailingIcon = {
                        TextButton(
                            onClick = {
                                mostrarSenha = !mostrarSenha
                            }
                        ) {
                            Text(
                                text = if (mostrarSenha) "Ocultar" else "Mostrar",
                                color = blue,
                                fontSize = 12.sp
                            )
                        }
                    }
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = manterConectado,
                            onCheckedChange = {
                                manterConectado = it
                            },
                            colors = CheckboxDefaults.colors(
                                checkedColor = blue
                            )
                        )

                        Text(
                            text = "Manter conectado",
                            fontSize = 12.sp,
                            color = Color.DarkGray
                        )
                    }

                    TextButton(
                        onClick = onForgotPasswordClick
                    ) {
                        Text(
                            text = "Esqueci a senha",
                            fontSize = 12.sp,
                            color = blue
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        onLoginClick(email, senha)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = blue
                    )
                ) {
                    Text(
                        text = "Entrar",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedButton(
                    onClick = onBiometricClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text(
                        text = "Entrar com biometria",
                        fontSize = 15.sp,
                        color = darkBlue
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ainda não possui cadastro?",
                        fontSize = 13.sp,
                        color = Color.Gray
                    )

                    TextButton(
                        onClick = onRegisterClick
                    ) {
                        Text(
                            text = "Cadastrar",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = blue
                        )
                    }
                }
            }
        }
    }
}
