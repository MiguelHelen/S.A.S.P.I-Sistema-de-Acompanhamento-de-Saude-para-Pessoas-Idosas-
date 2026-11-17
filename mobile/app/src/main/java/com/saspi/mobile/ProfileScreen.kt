
package com.saspi.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun ProfileScreen(
    onBackClick: () -> Unit = {},
    onLogoutClick: () -> Unit = {},
    onAccessibilityClick: () -> Unit = {}
) {
    SaspiPage {
        SaspiHeader(
            title = "Perfil e configurações",
            onBackClick = onBackClick
        )

        // Informações do perfil
        SaspiCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(66.dp)
                        .clip(CircleShape)
                        .background(SaspiColors.teal),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "MD",
                        color = SaspiColors.white,
                        fontSize = 21.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.width(15.dp))

                Column {
                    Text(
                        text = "Maria das Dores",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = SaspiColors.dark
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Idosa • 78 anos",
                        fontSize = 14.sp,
                        color = SaspiColors.gray
                    )
                }
            }
        }

        SaspiSectionTitle("Minha conta")

        SaspiCard {
            Text(
                text = "Dados pessoais",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = SaspiColors.dark
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Consulte as informações do seu perfil.",
                fontSize = 14.sp,
                color = SaspiColors.gray
            )
        }

        SaspiSectionTitle("Preferências")

        // Acesso à acessibilidade
        SaspiCard {
            Text(
                text = "Acessibilidade",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = SaspiColors.dark
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Personalize o tamanho do texto, o contraste e outras opções.",
                fontSize = 14.sp,
                color = SaspiColors.gray,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            SaspiOutlinedButton(
                text = "Configurar acessibilidade",
                onClick = onAccessibilityClick
            )
        }

        SaspiSectionTitle("Sessão")

        SaspiButton(
            text = "Sair da conta",
            onClick = onLogoutClick
        )

        Spacer(modifier = Modifier.height(12.dp))
    }
}
