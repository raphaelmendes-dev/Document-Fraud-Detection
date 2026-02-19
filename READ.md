# Análise Antifraude de Documentos - Simulação Azure AI Style

Projeto final do Bootcamp AI-102 Microsoft Azure (DIO + Microsoft)


## Objetivo do Projeto

Desenvolver uma solução automatizada para análise de documentos (notas fiscais, contratos, etc.) com foco em detecção de padrões de fraude, validação de autenticidade e consistência de dados, simulando o fluxo do **Azure AI Document Intelligence** (antigo Form Recognizer).

**Escopo principal**: Extração de texto/tabelas + aplicação de regras antifraude customizadas.

## Problema enfrentado com Azure

Devido a restrições comuns no Brasil (rejeição de cartões no cadastro do Free Tier / Azure for Students), não foi possível criar recurso Azure AI Document Intelligence.  

**Solução alternativa local e gratuita**:
- Extração de texto e tabelas com bibliotecas Python
- Regras de validação customizadas
- Interface web interativa com Streamlit

## Funcionalidades Implementadas

- Upload de PDF ou imagem (PNG/JPG/JPEG)
- Extração de texto limpo (pdfplumber)
- Extração de tabelas estruturadas (Camelot - alta precisão em DANFEs/NF-e)
- Regras antifraude:
  - Verificação de datas suspeitas (futuras ou muito antigas)
  - Validação de CNPJ (dígito verificador oficial)
  - Detecção de repetição excessiva ou múltiplos CNPJs
  - Verificação de soma inconsistente (itens vs total da nota)
- Relatório colorido com riscos (alto/médio), avisos e sucessos
- Mensagens explicativas sobre limitações e comparação com Azure real

## Tecnologias Utilizadas

- **Python 3.12+**
- **Streamlit** – Interface web
- **pdfplumber** – Extração de texto
- **Camelot-py** – Extração de tabelas (melhor para layouts fiscais brasileiros)
- **Pandas** – Manipulação de tabelas
- **Pillow** – Suporte a imagens
- **re / unicodedata** – Limpeza e regex

**Sem dependência de Azure ou APIs pagas.**

## Como Rodar Localmente

1. Clone o repositório:
git clone https://github.com/pythondevraphael-cmyk/antifraude-bootcamp-ai102
cd antifraude-bootcamp-ai102
text2. Instale as dependências:
pip install -r requirements.txt
text3. Execute:
streamlit run app.py
textAcesse no navegador: http://localhost:8501

## PDFs de Teste Recomendados

Use esses PDFs públicos reais de NF-e/DANFE para testar:

- [Nota fiscal notebook Dell (Prefeitura SP)](https://educacao.sme.prefeitura.sp.gov.br/wp-content/uploads/2019/07/nota-fiscal-notebook-dell.pdf)  
→ Tabela de itens clara, valores, CNPJ exemplo

- [Exemplo DANFE com logo](https://www.webdanfe.com.br/danfe/exemplos/danfe_com_logo.pdf)  
→ Layout mais completo

- [Nota de hospedagem (Câmara dos Deputados)](https://www.camara.leg.br/cota-parlamentar/documentos/publ/2939/2015/5641999.pdf)  
→ Documento simples, sem muitos itens

**Dica**: Para testar fraudes, edite um PDF (mude total, data futura ou CNPJ) usando ferramentas online como Smallpdf/ILovePDF.

## Deploy Online

O app está hospedado gratuitamente no **Streamlit Community Cloud**:

🔗 [Acessar o app online](https://SEU_USUARIO-antifraude-ai102.streamlit.app)  
*(link será atualizado após deploy)*

## Se tivesse acesso ao Azure

Usaria **Azure AI Document Intelligence** com:
- Modelo prebuilt para NF-e / recibos
- Modelo custom treinado com exemplos rotulados de fraudes
- OCR avançado + detecção de layout + extração de campos chave
- Integração com Azure Functions para análise em tempo real

## Limitações e Considerações

- Em PDFs de exemplo públicos, CNPJs podem ser fictícios/inválidos intencionalmente → o código detecta corretamente como risco/atenção.
- Tabelas complexas podem vir com pequenas imperfeições (Camelot é o melhor open-source para isso).
- Suporte a imagens ainda limitado (OCR futuro com pytesseract).

## Como Contribuir / Testar

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-regra`
3. Commit mudanças: `git commit -m "Adicionada regra X"`
4. Push: `git push origin feature/nova-regra`
5. Abra Pull Request

Sugestões bem-vindas: mais regras antifraude, suporte OCR, deploy alternativo, etc.

## Licença

MIT License - Livre para uso, modificação e distribuição (com créditos ao autor).

por Raphael | 2026 

Bootcamp AI-102 | DIO + Microsoft