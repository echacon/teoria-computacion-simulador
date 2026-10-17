#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
SIMULADOR Y MOTOR DE REDES DE PETRI (DES) - PROYECTO FÉNIX
Teoría de la Computación, Autómatas y Sistemas de Eventos Discretos
================================================================================
Implementa:
  1. Formalismo algebraico completo: Matriz de Incidencia C = I+ - I-
  2. Ecuación de Estado: M_{k+1} = M_k + C * u_k
  3. Redes Etiquetadas y Triggers con Determinismo Condicionado al Marcado
  4. Diagnóstico Causal de Demoras (Recursos vs. Calidad de Insumos vs. Variabilidad)
"""

import sys
import yaml

# Asegurar codificación UTF-8 en terminales Windows
if sys.platform == 'win32' and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

try:
    from tabulate import tabulate
except ImportError:
    tabulate = None


class PetriNet:
    def __init__(self, spec_dict):
        self.proceso = spec_dict.get('proceso', 'Proceso_Sin_Nombre')
        self.version = spec_dict.get('version', '1.0')
        self.descripcion = spec_dict.get('descripcion', '')

        # 1. Cargar Lugares (P)
        self.places = {}
        self.place_names = []
        self.initial_marking = []
        for p in spec_dict['lugares']:
            pid = p['id']
            self.places[pid] = p
            self.place_names.append(pid)
            self.initial_marking.append(p.get('tokens_iniciales', 0))

        # 2. Cargar Transiciones (T)
        self.transitions = {}
        self.transition_names = []
        for t in spec_dict['transiciones']:
            tid = t['id']
            self.transitions[tid] = t
            self.transition_names.append(tid)

        # 3. Construir Matrices de Pre-condición (I-) y Post-condición (I+)
        self.num_p = len(self.place_names)
        self.num_t = len(self.transition_names)
        self.p_idx = {name: i for i, name in enumerate(self.place_names)}
        self.t_idx = {name: j for j, name in enumerate(self.transition_names)}

        self.I_minus = [[0] * self.num_t for _ in range(self.num_p)]
        self.I_plus = [[0] * self.num_t for _ in range(self.num_p)]

        for arco in spec_dict['arcos']:
            orig = arco['de']
            dest = arco['a']
            peso = arco.get('peso', 1)

            if orig in self.p_idx and dest in self.t_idx:
                # Arco Lugar -> Transición (Precondición)
                self.I_minus[self.p_idx[orig]][self.t_idx[dest]] += peso
            elif orig in self.t_idx and dest in self.p_idx:
                # Arco Transición -> Lugar (Postcondición)
                self.I_plus[self.p_idx[dest]][self.t_idx[orig]] += peso

        # Matriz de Incidencia C = I+ - I-
        self.C = [
            [self.I_plus[p][t] - self.I_minus[p][t] for t in range(self.num_t)]
            for p in range(self.num_p)
        ]

        # Estado dinámico (Marcado M)
        self.M = list(self.initial_marking)
        self.trace = []
        self.sim_time = 0.0

    def reset(self):
        """Reinicia la red a su marcado inicial M0."""
        self.M = list(self.initial_marking)
        self.trace = []
        self.sim_time = 0.0

    def is_enabled(self, tid):
        """Verifica si la transición tid está habilitada: M >= I-(:, t)."""
        if tid not in self.t_idx:
            return False
        t = self.t_idx[tid]
        for p in range(self.num_p):
            if self.M[p] < self.I_minus[p][t]:
                return False
        return True

    def get_enabled_transitions(self):
        """Retorna la lista de IDs de transiciones actualmente habilitadas."""
        return [tid for tid in self.transition_names if self.is_enabled(tid)]

    def fire(self, tid, actual_duration=None, waiting_time=0.0):
        """
        Dispara la transición tid aplicando la ecuación fundamental:
        M_{k+1} = M_k + C * u_k
        """
        if not self.is_enabled(tid):
            raise ValueError(f"❌ Transición '{tid}' no está habilitada en el marcado actual.")

        t = self.t_idx[tid]
        t_meta = self.transitions[tid]
        nominal_duration = t_meta.get('duracion_nominal', 0)
        duration = actual_duration if actual_duration is not None else nominal_duration

        prev_M = list(self.M)

        # Aplicar actualización de marcado: M_next = M + C[:, t]
        for p in range(self.num_p):
            self.M[p] += self.C[p][t]

        start_time = self.sim_time + waiting_time
        end_time = start_time + duration
        self.sim_time = end_time

        step_record = {
            'step': len(self.trace) + 1,
            'transition': tid,
            'nombre': t_meta.get('nombre', tid),
            'trigger': t_meta.get('trigger', 'ε'),
            'prev_M': prev_M,
            'new_M': list(self.M),
            'waiting_time': waiting_time,
            'duration': duration,
            'nominal_duration': nominal_duration,
            'start_time': start_time,
            'end_time': end_time
        }
        self.trace.append(step_record)
        return step_record

    def dispatch_trigger(self, trigger_name, actual_duration=None, waiting_time=0.0):
        """
        Despachador de eventos de Fénix:
        Recibe un trigger externo (sensor u operador) y desambigua por marcado.
        """
        enabled = self.get_enabled_transitions()
        matching = [
            tid for tid in enabled 
            if self.transitions[tid].get('trigger', '') == trigger_name
        ]

        if len(matching) == 1:
            tid = matching[0]
            print(f"➜ [Fénix Trigger] '{trigger_name}' recibido ➔ Disparando '{tid}' ({self.transitions[tid].get('nombre')})")
            return self.fire(tid, actual_duration=actual_duration, waiting_time=waiting_time)
        elif len(matching) == 0:
            raise RuntimeError(
                f"🚨 [ALERTA FÉNIX - Incoherencia Físico-Digital]\n"
                f"   Trigger recibido: '{trigger_name}'\n"
                f"   Marcado actual: {self.get_marking_dict()}\n"
                f"   Transiciones habilitadas: {enabled}\n"
                f"   ➜ El evento es imposible en este estado. Posible sensor espurio o evento fuera de secuencia."
            )
        else:
            raise RuntimeError(
                f"⚠️ [Ambigüedad de Diseño] Múltiples transiciones habilitadas con el trigger '{trigger_name}': {matching}"
            )

    def get_marking_dict(self):
        """Retorna un diccionario amigable con los lugares que tienen al menos 1 ficha."""
        return {p: self.M[self.p_idx[p]] for p in self.place_names if self.M[self.p_idx[p]] > 0}

    def print_matrices(self):
        """Imprime la topología y matriz de incidencia de la red."""
        print(f"\n=======================================================")
        print(f"MODELO DE RED DE PETRI: {self.proceso} (v{self.version})")
        print(f"=======================================================")
        print(f"Lugares (P): {len(self.place_names)} | Transiciones (T): {len(self.transition_names)}")
        print("\nMatriz de Incidencia C = I+ - I-:")
        
        headers = ["Lugar \\ Trans"] + self.transition_names
        rows = []
        for p in self.place_names:
            p_i = self.p_idx[p]
            p_type = self.places[p].get('tipo', 'proceso')[0].upper()
            row = [f"{p} ({p_type})"] + [self.C[p_i][t_j] for t_j in range(self.num_t)]
            rows.append(row)

        col_widths = [max(len(str(item)) for item in col) for col in zip(*([headers] + rows))]
        fmt = "  ".join(f"{{:<{w}}}" for w in col_widths)
        print(fmt.format(*headers))
        print("-" * (sum(col_widths) + 2 * len(col_widths)))
        for r in rows:
            print(fmt.format(*[str(x) for x in r]))

    def diagnose_trace(self):
        """
        Módulo de Diagnóstico Causal Post-Mortem (Clase 12-B):
        Examina la traza de ejecución y clasifica la causa raíz de cualquier demora.
        """
        print("\n=======================================================")
        print("INFORME DE DIAGNÓSTICO CAUSAL DE RENDIMIENTO (FÉNIX)")
        print("=======================================================")
        total_time = self.sim_time
        total_nominal = sum(step['nominal_duration'] for step in self.trace)
        total_waiting = sum(step['waiting_time'] for step in self.trace)
        total_variance = sum(max(0, step['duration'] - step['nominal_duration']) for step in self.trace)

        print(f"Tiempo Total de Ciclo Observado: {total_time:.1f} min")
        print(f"Tiempo Nominal Teórico         : {total_nominal:.1f} min")
        print(f"Demora Acumulada               : {total_time - total_nominal:.1f} min")
        print("-" * 55)

        diagnosticos = []
        rework_detected = False

        for step in self.trace:
            tid = step['transition']
            wait = step['waiting_time']
            duration = step['duration']
            nominal = step['nominal_duration']

            # Causa 1: Espera en cola por recursos no disponibles
            if wait > 0:
                diagnosticos.append({
                    'etapa': step['nombre'],
                    'tipo': 'Fricción por Recursos',
                    'demora': f"{wait:.1f} min",
                    'detalle': f"La pieza estuvo en cola esperando que se liberara el recurso asignado."
                })

            # Causa 2: Retrabajos forzados por calidad de insumos defectuosa
            if 'rechazar' in tid or 'defect' in tid or 'retrabajo' in tid:
                rework_detected = True
                diagnosticos.append({
                    'etapa': step['nombre'],
                    'tipo': 'Calidad de Insumo Defectuosa',
                    'demora': f"{duration + nominal:.1f} min (ciclo extra)",
                    'detalle': f"Se disparó la transición de rechazo. La pieza debió reprocesarse por fallas dimensionales o de material."
                })

            # Causa 3: Variabilidad operacional intrínseca
            if duration > nominal:
                diagnosticos.append({
                    'etapa': step['nombre'],
                    'tipo': 'Variabilidad Operativa',
                    'demora': f"{duration - nominal:.1f} min",
                    'detalle': f"La tarea activa tardó más de su valor nominal (desgaste de herramienta o lentitud operativa)."
                })

        if not diagnosticos:
            print("✅ RENDIMIENTO ÓPTIMO: El proceso culminó dentro de los valores nominales previstos sin demoras.")
        else:
            print("🔍 CAUSAS RAÍZ IDENTIFICADAS:")
            for d in diagnosticos:
                print(f"  • [{d['tipo']}] en '{d['etapa']}': +{d['demora']}")
                print(f"    ➜ {d['detalle']}")


def run_benchmark():
    print("=" * 70)
    print("DEMOSTRACIÓN DE SIMULACIÓN Y DIAGNÓSTICO CON REDES DE PETRI")
    print("Cátedra de Teoría de la Computación / Proyecto Fénix")
    print("=" * 70)

    # Cargar especificación YAML
    yaml_path = "recurso_petri.yaml"
    try:
        with open(yaml_path, 'r', encoding='utf-8') as f:
            spec = yaml.safe_load(f)
    except FileNotFoundError:
        print(f"❌ Error: Archivo '{yaml_path}' no encontrado.")
        sys.exit(1)

    pn = PetriNet(spec)
    pn.print_matrices()

    # --------------------------------------------------------------------------
    # ESCENARIO 1: Ejecución Nominal / Ideal (Sin Demoras)
    # --------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("ESCENARIO 1: CASO NOMINAL (Flujo Ideal)")
    print("=" * 70)
    pn.reset()
    pn.dispatch_trigger("INICIAR_MECANIZADO", waiting_time=0.0) # Torno libre arranca de inmediato
    pn.dispatch_trigger("SENSOR_MECANIZADO_LISTO")              # Torneado nominal
    pn.dispatch_trigger("INSPECCION_OK")                        # Aprobado a la primera
    pn.diagnose_trace()

    # --------------------------------------------------------------------------
    # ESCENARIO 2: Demora por Falta de Recurso (Contención de Torno CNC)
    # --------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("ESCENARIO 2: DEMORA POR FALTA DE RECURSO (Torno ocupado por otro lote)")
    print("=" * 70)
    pn.reset()
    # La pieza llega a las 08:00 pero el torno está ocupado hasta las 08:45 (45 min de espera)
    pn.dispatch_trigger("INICIAR_MECANIZADO", waiting_time=45.0)
    pn.dispatch_trigger("SENSOR_MECANIZADO_LISTO")
    pn.dispatch_trigger("INSPECCION_OK")
    pn.diagnose_trace()

    # --------------------------------------------------------------------------
    # ESCENARIO 3: Demora por Calidad de Insumos (Retrabajo de Lote Defectuoso)
    # --------------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("ESCENARIO 3: DEMORA POR CALIDAD DE INSUMO (Rechazo + Retrabajo)")
    print("=" * 70)
    pn.reset()
    pn.dispatch_trigger("INICIAR_MECANIZADO", waiting_time=0.0)
    pn.dispatch_trigger("SENSOR_MECANIZADO_LISTO")
    pn.dispatch_trigger("INSPECCION_RECHAZO")                   # ¡Falla en inspección!
    pn.dispatch_trigger("REINGRESAR_LOTE")                      # Reingresa a entrada
    pn.dispatch_trigger("INICIAR_MECANIZADO", waiting_time=5.0) # Espera 5m y repite maquinado
    pn.dispatch_trigger("SENSOR_MECANIZADO_LISTO")
    pn.dispatch_trigger("INSPECCION_OK")                        # Ahora sí aprueba
    pn.diagnose_trace()


if __name__ == '__main__':
    run_benchmark()
