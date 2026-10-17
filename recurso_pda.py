import sys
import yaml

class PDA:
    def __init__(self, alphabet, stack_alphabet, transitions, q0, z0, final_states):
        self.alphabet = alphabet             # Alfabeto de eventos de entrada (Sigma)
        self.stack_alphabet = stack_alphabet # Alfabeto de la pila (Gamma)
        self.transitions = transitions       # Clave: (estado, evento, tope_pila) -> (nuevo_estado, push_list)
        self.q0 = q0                         # Estado inicial
        self.z0 = z0                         # Símbolo inicial de fondo de pila
        self.final_states = final_states     # Estados de aceptación / marcados
        
        self.current_state = q0
        self.stack = [z0]                    # Pila física LIFO
        self.history = []

    def get_stack_top(self):
        return self.stack[-1] if self.stack else None

    def reset(self):
        self.current_state = self.q0
        self.stack = [self.z0]
        self.history = []

    def transition(self, event):
        if event not in self.alphabet:
            raise ValueError(f"❌ [Error de Alfabeto] El evento '{event}' no pertenece al catálogo del recurso.")

        stack_top = self.get_stack_top()
        if stack_top is None:
            raise RuntimeError("❌ [Falla Crítica] Pila vacía sin símbolo base. Bloqueo del autómata.")

        key = (self.current_state, event, stack_top)
        
        if key not in self.transitions:
            raise ValueError(
                f"❌ [Transición No Permitida] No existe regla para:\n"
                f"   Estado actual : '{self.current_state}'\n"
                f"   Evento recibido: '{event}'\n"
                f"   Tope de Pila  : '{stack_top}'\n"
                f"   ➜ Violación de contexto: esta operación no corresponde al sub-proceso activo."
            )

        new_state, push_symbols = self.transitions[key]
        
        # 1. POP del tope actual
        popped = self.stack.pop()
        
        # 2. PUSH de los nuevos símbolos (en orden inverso para que push_symbols[0] quede arriba)
        for sym in reversed(push_symbols):
            self.stack.append(sym)
            
        prev_state = self.current_state
        self.current_state = new_state
        self.history.append((event, prev_state, new_state, self.stack.copy()))
        
        # Determinar tipo de operación
        if len(push_symbols) == 0:
            op_str = f"[POP {popped}] ⬇️"
        elif len(push_symbols) == 2 and push_symbols[1] == popped:
            op_str = f"[PUSH {push_symbols[0]}] ⬆️"
        else:
            op_str = f"[STAY/REPLACE {popped} ➜ {push_symbols}] 🔄"

        print(f"➜ Transición: {prev_state} ──({event})──> {new_state} | Operación: {op_str}")
        print(f"   Memoria de Pila LIFO: [ {' | '.join(self.stack)} ] (Tope: '{self.get_stack_top()}')")

    def is_accepted(self):
        # Aceptación por estado final y pila limpia en símbolo base z0
        return (self.current_state in self.final_states['exito']) and (self.stack == [self.z0])


def main():
    print("=" * 65)
    print("   MOTOR DE EJECUCIÓN CON AUTÓMATA DE PILA (PDA) - HITO 2")
    print("   Seguimiento en Tiempo Real de Workflows y Sub-procesos")
    print("=" * 65)

    # 1. Cargar especificación YAML
    try:
        with open("recurso_pda.yaml", "r", encoding="utf-8") as f:
            spec = yaml.safe_load(f)
    except FileNotFoundError:
        print("❌ Error: No se encontró 'recurso_pda.yaml'.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error al parsear YAML: {e}")
        sys.exit(1)

    # 2. Construir mapa de transiciones
    transitions_map = {}
    for t in spec['transiciones_pda']:
        key = (t['de'], t['evento'], t['tope_pila'])
        transitions_map[key] = (t['a'], t['apilar'])

    alphabet = [e['id'] for e in spec['eventos']]
    stack_alphabet = spec['alfabeto_pila']
    q0 = spec['estado_inicial']
    z0 = spec['simbolo_inicial_pila']
    final_states = spec['estados_finales']

    # 3. Instanciar Motor PDA
    motor = PDA(alphabet, stack_alphabet, transitions_map, q0, z0, final_states)

    print(f"✔ Recurso cargado: {spec['recurso']} ({spec['tipo']})")
    print(f"✔ Estado Inicial: {q0} | Fondo de Pila: {z0}")
    print(f"✔ Alfabeto de Pila (Contextos): {stack_alphabet}")
    print("-" * 65)
    print("Comandos disponibles: Escribe el nombre del evento o 'salir' para terminar.")
    print("Eventos del catálogo:", ", ".join(alphabet))
    print("-" * 65)

    while True:
        try:
            prompt = f"\n[{motor.current_state} | Tope: '{motor.get_stack_top()}'] Evento ➜ "
            event_input = input(prompt).strip()
            
            if event_input.lower() == 'salir':
                break
            if not event_input:
                continue

            motor.transition(event_input)

            if motor.current_state in final_states['exito']:
                if motor.stack == [z0]:
                    print("\n🎉 ¡ÉXITO TOTAL! El producto concluyó todos los sub-procesos y fue despachado.")
                else:
                    print("\n⚠️ [Advertencia] En estado de éxito pero con sub-procesos aún abiertos en la pila.")
            elif motor.current_state in final_states['falla']:
                print("\n🚨 [BLOQUEO] El recurso ha caído en estado de falla.")

        except (ValueError, RuntimeError) as err:
            print(err)
        except KeyboardInterrupt:
            print("\nSimulación finalizada por el usuario.")
            break

    print("\n" + "=" * 65)
    print("              REPORTE DE AUDITORÍA Y TRAZABILIDAD")
    print("=" * 65)
    print(f"Estado Final: {motor.current_state}")
    print(f"Contenido Final de la Pila: {motor.stack}")
    print(f"Historial de Pasos ({len(motor.history)} eventos procesados):")
    for i, (ev, s_from, s_to, st_snapshot) in enumerate(motor.history, 1):
        print(f"  {i}. Evento '{ev}': {s_from} ➜ {s_to} | Pila resultante: {st_snapshot}")
    
    if motor.is_accepted():
        print("\n✔ RESULTADO: Traza ACEPTADA formalmente por el PDA (Proceso balanceado).")
    else:
        print("\n❌ RESULTADO: Traza RECHAZADA (Proceso incompleto o desbalanceado).")


if __name__ == "__main__":
    main()
