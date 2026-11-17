
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
            MaterialTheme {
                var currentScreen by remember {
                    mutableStateOf("splash")
                }

                var selectedElderly by remember {
                    mutableStateOf("Maria Oliveira")
                }

                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    when (currentScreen) {

                        "splash" -> {
                            SplashScreen(
                                onContinue = {
                                    currentScreen = "login"
                                }
                            )
                        }

                        "login" -> {
                            LoginScreen(
                                onLoginClick = { email, senha ->
                                    if (email.isNotBlank() && senha.isNotBlank()) {
                                        currentScreen = "home"
                                    }
                                },
                                onBiometricClick = {
                                    currentScreen = "home"
                                },
                                onForgotPasswordClick = {
                                    currentScreen = "recovery"
                                },
                                onRegisterClick = {
                                    currentScreen = "register"
                                }
                            )
                        }

                        "recovery" -> {
                            RecoveryScreen(
                                onBackClick = {
                                    currentScreen = "login"
                                }
                            )
                        }

                        "register" -> {
                            RegisterScreen(
                                onBackClick = {
                                    currentScreen = "login"
                                },
                                onRegisterClick = {
                                    currentScreen = "login"
                                }
                            )
                        }

                        "home" -> {
                            HomeScreen(
                                elderlyName = selectedElderly,
                                onVitalsClick = {
                                    currentScreen = "vitals"
                                },
                                onMedicationsClick = {
                                    currentScreen = "medications"
                                },
                                onAlertsClick = {
                                    currentScreen = "alerts"
                                },
                                onConsultasClick = {
                                    currentScreen = "consultas"
                                },
                                onProfileClick = {
                                    currentScreen = "profile"
                                },
                                onAddMedicationClick = {
                                    currentScreen = "addMedication"
                                },
                                onRegisterVitalsClick = {
                                    currentScreen = "registerVitals"
                                },
                                onSOSClick = {
                                    currentScreen = "emergency"
                                },
                                onHelpClick = {
                                    currentScreen = "help"
                                },
                                onCaregiverDashboardClick = {
                                    currentScreen = "caregiver"
                                },
                                onSelectElderlyClick = {
                                    currentScreen = "selectElderly"
                                }
                            )
                        }

                        "caregiver" -> {
                            CaregiverDashboardScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                },
                                onSelectElderly = {
                                    currentScreen = "selectElderly"
                                },
                                onSOSClick = {
                                    currentScreen = "emergency"
                                },
                                onHelpClick = {
                                    currentScreen = "help"
                                }
                            )
                        }

                        "selectElderly" -> {
                            SelectElderlyScreen(
                                onBackClick = {
                                    currentScreen = "caregiver"
                                },
                                onElderSelected = { name ->
                                    selectedElderly = name
                                    currentScreen = "home"
                                }
                            )
                        }

                        "medications" -> {
                            MedicationsScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                }
                            )
                        }

                        "addMedication" -> {
                            AddEditMedicationScreen(
                                onBackClick = {
                                    currentScreen = "medications"
                                },
                                onSaveClick = {
                                    currentScreen = "medications"
                                }
                            )
                        }

                        "vitals" -> {
                            VitalsScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                }
                            )
                        }

                        "registerVitals" -> {
                            RegisterVitalsScreen(
                                onBackClick = {
                                    currentScreen = "vitals"
                                },
                                onSaveClick = {
                                    currentScreen = "vitals"
                                }
                            )
                        }

                        "consultas" -> {
                            ConsultasExamesScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                }
                            )
                        }

                        "alerts" -> {
                            AlertsScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                }
                            )
                        }

                        "emergency" -> {
                            EmergencyScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                }
                            )
                        }

                        "profile" -> {
                            ProfileScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                },
                                onLogoutClick = {
                                    currentScreen = "login"
                                },
                                onAccessibilityClick = {
                                    currentScreen = "accessibility"
                                }
                            )
                        }

                        "accessibility" -> {
                            AccessibilityScreen(
                                onBackClick = {
                                    currentScreen = "profile"
                                }
                            )
                        }

                        "help" -> {
                            HelpSupportScreen(
                                onBackClick = {
                                    currentScreen = "home"
                                }
                            )
                        }

                        else -> {
                            SplashScreen(
                                onContinue = {
                                    currentScreen = "login"
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
