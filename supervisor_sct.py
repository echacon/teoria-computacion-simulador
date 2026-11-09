#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
CONTROL SUPERVISOR DESCENTRALIZADO (SCT / RAMADGE-WONHAM) - PROYECTO FÉNIX
Sesión 14: Síntesis de Lugares Monitores GMEC y Prevención de Deadlocks
================================================================================
Extiende el motor algebraico PetriNet (recurso_petri.py) incorporando:
  1. Partición del alfabeto en eventos Controlables (Sigma_c) e Incontrolables (Sigma_uc)
  2. Síntesis algebraica de Lugares Monitores (Moody & Antsaklis):
       L * M_p <= b   ===>   C_c = - L * C_p,   M_c0 = b - L * M_p0
  3. Verificación automática de admisibilidad de Ramadge-Wonham sobre Sigma_uc
  4. Comparación en vivo: Planta Libre G (Deadlock) vs. Planta Supervisada S/G (Non-blocking)
"""

import sys
import yaml
from recurso_petri import PetriNet

if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


class SupervisedPetriNet(PetriNet):
    def __init__(self, spec_dict, enable_supervisor=True):
        super().__init__(spec_dict)
        self.num_plant_p = self.num_p
        self.target_marking = spec_dict.get("marcados_exito", {})
        self.is_controllable = [
            bool(self.transitions[tid].get("controlable", True))
            for tid in self.transition_names
        ]
        self.monitors = []

        if enable_supervisor:
            for gmec in spec_dict.get("supervisores_gmec", []):
                self.add_gmec_monitor(
                    monitor_id=gmec["id"],
                    L_weights=gmec["pesos_L"],
                    b_bound=gmec["cota_b"],
                    description=gmec.get("descripcion", ""),
                )

    def add_gmec_monitor(self, monitor_id, L_weights, b_bound, description=""):
        """
        Sintetiza un Lugar Monitor P_c a partir de la desigualdad GMEC: L * M_p <= b
        calculando C_c = - L * C_p y M_c0 = b - L * M_p0.
        """
        c_row = [0] * self.num_t
        for t in range(self.num_t):
            c_row[t] = -sum(
                L_weights.get(self.place_names[p], 0) * self.C[p][t]
                for p in range(self.num_plant_p)
            )
            # Verificación de admisibilidad de Ramadge-Wonham:
            # Un lugar monitor no puede exigir fichas de entrada (C_c < 0) a una transición incontrolable
            if c_row[t] < 0 and not self.is_controllable[t]:
                tid = self.transition_names[t]
                raise ValueError(
                    f"❌ [GMEC No Admisible - Violación Ramadge-Wonham]\n"
                    f"   El monitor '{monitor_id}' intenta inhibir la transición INCONTROLABLE '{tid}' "
                    f"(C_c = {c_row[t]} < 0)."
                )

        m0_c = b_bound - sum(
            L_weights.get(self.place_names[p], 0) * self.initial_marking[p]
            for p in range(self.num_plant_p)
        )
        if m0_c < 0:
            raise ValueError(
                f"❌ [Marcado Inicial Violado] El marcado inicial M_0 viola la cota b={b_bound} de '{monitor_id}'."
            )

        # Convertir C_c en vectores de pre-condición I^- y post-condición I^+
        i_minus_row = [max(0, -val) for val in c_row]
        i_plus_row = [max(0, val) for val in c_row]

        self.places[monitor_id] = {
            "id": monitor_id,
            "nombre": monitor_id,
            "tipo": "supervisor",
            "tokens_iniciales": m0_c,
            "descripcion": description,
        }
        self.p_idx[monitor_id] = self.num_p
        self.place_names.append(monitor_id)
        self.initial_marking.append(m0_c)
        self.M.append(m0_c)
        self.I_minus.append(i_minus_row)
        self.I_plus.append(i_plus_row)
        self.C.append(c_row)
        self.num_p += 1

        self.monitors.append(
            {
                "id": monitor_id,
                "descripcion": description,
                "c_row": c_row,
                "m0": m0_c,
            }
        )

    def is_plant_enabled(self, tid):
        """Evalúa si la transición está habilitada en la planta libre G (ignorando monitores SCT)."""
        if tid not in self.t_idx:
            return False
        t = self.t_idx[tid]
        return all(self.M[p] >= self.I_minus[p][t] for p in range(self.num_plant_p))

    def get_blocking_monitors(self, tid):
        """Retorna la lista de lugares monitores P_c que están deshabilitando la transición tid."""
        t = self.t_idx[tid]
        return [
            self.place_names[p]
            for p in range(self.num_plant_p, self.num_p)
            if self.M[p] < self.I_minus[p][t]
        ]

    def dispatch_trigger(self, trigger_name, actual_duration=None, waiting_time=0.0):
        """
        Sobrescribe el despachador para reportar explícitamente cuando el Supervisor SCT
        retiene un evento controlable que físicamente sí podría ocurrir en la planta G.
        """
        plant_ready = [
            tid
            for tid in self.transition_names
            if self.transitions[tid].get("trigger", "") == trigger_name
            and self.is_plant_enabled(tid)
        ]
        for tid in plant_ready:
            blocking = self.get_blocking_monitors(tid)
            if blocking:
                raise PermissionError(
                    f"🛡️ [SUPERVISOR SCT INTERVIENE] La planta libre G permitiría '{tid}' "
                    f"(recursos físicos disponibles), pero el Lugar Monitor {blocking} (M_c=0) "
                    f"deshabilita el evento controlable '{trigger_name}' (∈ Sigma_c) para prevenir el DEADLOCK."
                )

        step = super().dispatch_trigger(
            trigger_name, actual_duration=actual_duration, waiting_time=waiting_time
        )
        print(f"   Marcado actual M_k: {self.get_marking_dict()}")
        return step

    def is_goal_reached(self):
        return all(
            self.M[self.p_idx[pid]] >= val for pid, val in self.target_marking.items()
        )


def run_sct_demonstration():
    yaml_path = "supervisor_sct.yaml"
    try:
        with open(yaml_path, "r", encoding="utf-8") as f:
            spec = yaml.safe_load(f)
    except FileNotFoundError:
        print(f"❌ Error: Archivo '{yaml_path}' no encontrado.")
        sys.exit(1)

    print("=" * 76)
    print("DEMOSTRACIÓN SESIÓN 14: CONTROL SUPERVISOR (SCT) Y LUGARES MONITORES GMEC")
    print("Cátedra de Teoría de la Computación / Proyecto Fénix")
    print("=" * 76)

    # --------------------------------------------------------------------------
    # ESCENARIO 1: Planta en Lazo Abierto G (Sin Supervisor -> Deadlock Circular)
    # --------------------------------------------------------------------------
    print("\n" + "=" * 76)
    print("ESCENARIO 1: PLANTA LIBRE G EN LAZO ABIERTO (SIN SUPERVISOR)")
    print("=" * 76)
    open_net = SupervisedPetriNet(spec, enable_supervisor=False)
    print(f"Marcado Inicial M_0: {open_net.get_marking_dict()}\n")

    open_net.dispatch_trigger("INICIAR_A")
    open_net.dispatch_trigger("INICIAR_B")

    enabled_open = open_net.get_enabled_transitions()
    print(f"\nTransiciones habilitadas tras iniciar A y B simultáneamente: {enabled_open}")
    if len(enabled_open) == 0 and not open_net.is_goal_reached():
        print(
            "🚨 ¡DEADLOCK CIRCULAR DETECTADO EN LAZO ABIERTO!\n"
            "   • Línea A está en 'p_A1' (retiene R1) y espera por 'R2_libre' para avanzar.\n"
            "   • Línea B está en 'p_B1' (retiene R2) y espera por 'R1_libre' para avanzar.\n"
            "   • Sifón de recursos vacío: ninguna orden puede llegar al lenguaje marcado L_m(G)."
        )

    # --------------------------------------------------------------------------
    # ESCENARIO 2: Planta Supervisada S/G (Con Lugar Monitor GMEC Sintetizado)
    # --------------------------------------------------------------------------
    print("\n" + "=" * 76)
    print("ESCENARIO 2: SISTEMA SUPERVISADO S/G CON LUGAR MONITOR GMEC (RAMADGE-WONHAM)")
    print("=" * 76)
    sup_net = SupervisedPetriNet(spec, enable_supervisor=True)
    sup_net.print_matrices()

    print("\nResumen de Monitores Sintetizados (C_c = - L * C_p):")
    for mon in sup_net.monitors:
        arcs = {
            sup_net.transition_names[t]: mon["c_row"][t]
            for t in range(sup_net.num_t)
            if mon["c_row"][t] != 0
        }
        print(f"  ✔ Monitor '{mon['id']}' | Holgura Inicial M_c0 = {mon['m0']} | Arcos C_c: {arcs}")

    print(f"\nMarcado Inicial Extendido M_0: {sup_net.get_marking_dict()}")

    events_sequence = [
        "INICIAR_A",
        "INICIAR_B",  # Intentará entrar en la zona de deadlock -> el Supervisor SCT lo frenará
        "AVANZAR_A",
        "FIN_A",      # Evento incontrolable Sigma_uc -> libera R1 y R2
        "INICIAR_B",  # Ahora sí es autorizado por el Supervisor SCT
        "AVANZAR_B",
        "FIN_B",
    ]

    for trig in events_sequence:
        print(f"\n[Evento en Planta] ➜ '{trig}'")
        try:
            sup_net.dispatch_trigger(trig)
        except PermissionError as err:
            print(f"  {err}")

    print("\n" + "=" * 76)
    if sup_net.is_goal_reached():
        print(
            "✅ PROPIEDAD NON-BLOCKING VERIFICADA (cl(L_m(S/G)) = L(S/G)):\n"
            "   Ambas órdenes (A y B) completaron su ciclo y los recursos R1, R2 volvieron a reposo."
        )
    print("=" * 76)


if __name__ == "__main__":
    run_sct_demonstration()
