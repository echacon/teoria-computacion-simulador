import sys
import yaml

class DFA:
    def __init__(self, alphabet, transitions, q0, F):
        self.alphabet = alphabet       # Alfabeto de eventos
        self.transitions = transitions # Función de transición: {estado: {evento: nuevo_estado}}
        self.q0 = q0                   # Estado inicial
        self.F = F                     # Estados de aceptación (éxito/falla)
        self.current_state = q0
        self.history = []

    def reset(self):
        self.current_state = self.q0
        self.history = []

    def transition(self, event):
        if event not in self.alphabet:
            raise ValueError(f"❌ Evento '{event}' no pertenece al alfabeto del recurso.")
        
        state_transitions = self.transitions.get(self.current_state, {})
        if event in state_transitions:
            prev_state = self.current_state
            self.current_state = state_transitions[event]
            self.history.append(event)
            print(f"➜ [Transición] Evento '{event}': {prev_state} ➜ {self.current_state}")
        else:
            raise ValueError(f"❌ Transición no definida: Evento '{event}' no permitido en el estado '{self.current_state}'.")

    def is_accepted(self):
        return self.current_state in self.F


def main():
    print("--- MOTOR DFA GENÉRICO DE RECURSO ---")
    
    # 1. Cargar archivo de especificación YAML
    try:
        with open("recurso.yaml", "r", encoding="utf-8") as f:
            spec = yaml.safe_load(f)
    except FileNotFoundError:
        print("❌ Error: No se encontró el archivo 'recurso.yaml' en el directorio.")
        print("Crea un archivo 'recurso.yaml' con la ontología del proceso antes de ejecutar.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error al leer 'recurso.yaml': {e}")
        sys.exit(1)

    # 2. Mapear las transiciones del formato YAML al diccionario del motor
    transitions_map = {}
    for t in spec['transiciones']:
        state_from = t['de']
        event = t['evento']
        state_to = t['a']
        transitions_map.setdefault(state_from, {})[event] = state_to

    # 3. Extraer alfabeto y estados finales
    alphabet = [e['id'] for e in spec['eventos']]
    success_states = spec['estados_finales']['exito']
    failure_states = spec['estados_finales']['falla']
    final_states = success_states + failure_states

    # 4. Instanciar el motor DFA
    recurso_dfa = DFA(
        alphabet=alphabet,
        transitions=transitions_map,
        q0=spec['estado_inicial'],
        F=final_states
    )

    print(f"Recurso '{spec['recurso']}' cargado con éxito.")
    print(f"Estado Inicial: {recurso_dfa.current_state}")
    print(f"Estados Finales de Éxito: {success_states}")
    print(f"Estados Finales de Falla: {failure_states}")
    print("--------------------------------------")

    # 5. Entrada interactiva de eventos por consola
    print("\nIntroduce eventos uno a uno (o escribe 'salir' para finalizar):")
    while True:
        try:
            event_input = input(f"[{recurso_dfa.current_state}] Evento ➜ ").strip()
            if event_input.lower() == 'salir':
                break
            
            recurso_dfa.transition(event_input)
            
            if recurso_dfa.current_state in success_states:
                print("🎉 ¡Hito alcanzado! El recurso completó el proceso con ÉXITO.")
            elif recurso_dfa.current_state in failure_states:
                print("🚨 ¡Alerta! El recurso ha quedado bloqueado en estado de FALLA CRÍTICA.")

        except ValueError as err:
            print(err)
        except KeyboardInterrupt:
            print("\nSimulación interrumpida.")
            break

    print("\n--- Auditoría de la Simulación ---")
    print(f"Historial de eventos (Traza): {' ➜ '.join(recurso_dfa.history) if recurso_dfa.history else 'Ninguno'}")
    print(f"Estado Final del Recurso: {recurso_dfa.current_state}")
    if recurso_dfa.is_accepted():
        print("Resultado: Traza ACEPTADA por el autómata.")
    else:
        print("Resultado: Traza RECHAZADA (el recurso no alcanzó un estado final marcado).")


if __name__ == "__main__":
    main()
