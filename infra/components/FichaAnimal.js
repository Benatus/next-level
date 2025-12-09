/* infra/components/FichaAnimal.js */
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image as PdfImage,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "#333",
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#006837",
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#006837",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  idBox: {
    marginTop: 5,
    padding: "4 10",
    backgroundColor: "#eee",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
  topContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  photoCol: {
    width: "30%",
    marginRight: 15,
  },
  infoCol: {
    width: "70%",
  },
  imageSection: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  image: {
    height: "100%",
    objectFit: "contain",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#006837",
    padding: "4 8",
    marginBottom: 10,
    borderRadius: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingBottom: 2,
  },
  label: { width: "35%", fontWeight: "bold", color: "#555", fontSize: 10 },
  value: { width: "65%", fontSize: 10, color: "#000" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
});

const formatBool = (val) => (val ? "Sim" : "Não");
const formatDate = (dateString) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleDateString("pt-BR");
};
// Formata Data e Hora para o PDF
const formatDateTime = (dateString) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRegistroLabel = (data) => {
  if (!data.nome || data.nome.trim() === "") return `N° ${data.id}`;
  return `N° ${data.id} - ${data.nome}`;
};

export default function FichaAnimal({ data }) {
  if (!data) return null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Ficha de Registro Animal</Text>
          <Text style={styles.subtitle}>
            CEMSA - Centro Municipal de Saúde Animal
          </Text>
          <View style={styles.idBox}>
            <Text>Registro: {getRegistroLabel(data)}</Text>
          </View>
        </View>

        {/* Topo Dividido */}
        <View style={styles.topContainer}>
          <View style={styles.photoCol}>
            <View style={styles.imageSection}>
              {data.imagem_url ? (
                <PdfImage src={data.imagem_url} style={styles.image} />
              ) : (
                <Text style={{ fontSize: 8, color: "#999" }}>Sem Foto</Text>
              )}
            </View>
          </View>

          <View style={styles.infoCol}>
            <View style={[styles.section, { marginBottom: 0 }]}>
              <Text style={styles.sectionTitle}>Dados do Animal</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Espécie:</Text>
                <Text style={styles.value}>{data.especie}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Sexo:</Text>
                <Text style={styles.value}>{data.sexo}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status Atual:</Text>
                <Text style={styles.value}>{data.status}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Data Cadastro:</Text>
                <Text style={styles.value}>{formatDate(data.criado_em)}</Text>
              </View>

              {/* NOVOS CAMPOS: Atualização do Animal */}
              <View style={styles.row}>
                <Text style={styles.label}>Última Atualização:</Text>
                <Text style={styles.value}>
                  {formatDateTime(data.atualizado_em)}
                </Text>
              </View>
              {data.atualizado_por && (
                <View style={styles.row}>
                  <Text style={styles.label}>Atualizado por:</Text>
                  <Text style={styles.value}>{data.atualizado_por}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Dados do Resgate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Resgate</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Local de Encontro:</Text>
            <Text style={styles.value}>{data.local || "---"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Destino Inicial:</Text>
            <Text style={styles.value}>{data.destino || "---"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Agente Responsável:</Text>
            <Text style={styles.value}>{data.agente || "---"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Solicitante:</Text>
            <Text style={styles.value}>{data.solicitante || "---"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tel. Solicitante:</Text>
            <Text style={styles.value}>
              {data.telefone_solicitante || "---"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Animal de Rua?</Text>
            <Text style={styles.value}>{formatBool(data.animal_de_rua)}</Text>
          </View>

          {/* NOVOS CAMPOS: Atualização do Resgate */}
          <View style={[styles.row, { marginTop: 5 }]}>
            <Text style={styles.label}>Última Atualização:</Text>
            <Text style={styles.value}>
              {formatDateTime(data.resgate_atualizado_em)}
            </Text>
          </View>
          {data.resgate_atualizado_por && (
            <View style={styles.row}>
              <Text style={styles.label}>Atualizado por:</Text>
              <Text style={styles.value}>{data.resgate_atualizado_por}</Text>
            </View>
          )}
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.5, minHeight: 40 }}>
            {data.observacao || "Nenhuma observação registrada."}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Documento gerado eletronicamente pelo sistema CEMSA em{" "}
            {new Date().toLocaleString("pt-BR")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
