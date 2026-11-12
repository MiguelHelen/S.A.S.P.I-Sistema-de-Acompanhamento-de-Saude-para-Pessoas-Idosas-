package com.saspi.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var currentScreen by remember { mutableStateOf("login") }

            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                when (currentScreen) {
                    "login" -> LoginScreen(
                        onLoginClick = { _, _ -> currentScreen = "home" }
                    )
                    "home" -> HomeScreen(
                        onNavigateToVitals = { currentScreen = "vitals" },
                        onNavigateToAlerts = { currentScreen = "alerts" },
                        onNavigateToConsultas = { currentScreen = "consultas" },
                        onNavigateToMedications = { currentScreen = "medications" }
                        // Se quiser adicionar um botão de perfil na HomeScreen futuramente, 
                        // basta adicionar aqui: onNavigateToProfile = { currentScreen = "profile" }
                    )
                    "vitals" -> VitalsScreen(
                        onBackClick = { currentScreen = "home" }
                    )
                    "alerts" -> AlertsScreen(
                        onBackClick = { currentScreen = "home" }
                    )
                    "consultas" -> ConsultasExamesScreen(
                        onBackClick = { currentScreen = "home" }
                    )
                    "medications" -> MedicationsScreen(
                        onBackClick = { currentScreen = "home" }
                    )
                    "profile" -> ProfileScreen(
                        onBackClick = { currentScreen = "home" },
                        onLogoutClick = { currentScreen = "login" }
                    )
                }
            }
        }
    }
}