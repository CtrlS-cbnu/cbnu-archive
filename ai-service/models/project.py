{
  "nbformat": 4,
  "nbformat_minor": 0,
  "metadata": {
    "colab": {
      "provenance": [],
      "authorship_tag": "ABX9TyMr9/oghi3YcSgBJG7Zz5VQ",
      "include_colab_link": true
    },
    "kernelspec": {
      "name": "python3",
      "display_name": "Python 3"
    },
    "language_info": {
      "name": "python"
    }
  },
  "cells": [
    {
      "cell_type": "markdown",
      "metadata": {
        "id": "view-in-github",
        "colab_type": "text"
      },
      "source": [
        "<a href=\"https://colab.research.google.com/github/ohjaesik/cbnu-archive/blob/main/ai-service/models/project_py.ipynb\" target=\"_parent\"><img src=\"https://colab.research.google.com/assets/colab-badge.svg\" alt=\"Open In Colab\"/></a>"
      ]
    },
    {
      "cell_type": "code",
      "execution_count": 1,
      "metadata": {
        "id": "rR1YLS0N7Ryl"
      },
      "outputs": [],
      "source": [
        "from __future__ import annotations\n",
        "\n",
        "from dataclasses import dataclass\n",
        "from typing import Dict, List, Optional"
      ]
    },
    {
      "cell_type": "code",
      "source": [
        "@dataclass\n",
        "class ProjectInput:\n",
        "  project_id: int\n",
        "  title: str\n",
        "  short_summary: str\n",
        "  description: str\n",
        "  readme: str\n",
        "  report_text: str\n",
        "  file_names: List[str]\n",
        "  folder_paths: List[str]\n",
        "  config_texts: Dict[str, str]\n",
        "  course_name: str\n",
        "  semester: str"
      ],
      "metadata": {
        "id": "M287cKgV7g3V"
      },
      "execution_count": 2,
      "outputs": []
    },
    {
      "cell_type": "code",
      "source": [
        "@dataclass\n",
        "class MetadataResult:\n",
        "  project_id: int\n",
        "  topic: Optional[str]\n",
        "  sub_topics: List[str]\n",
        "  tech_stack: List[str]\n",
        "  languages: List[str]\n",
        "  keywords: List[str]\n",
        "  project_type: Optional[str]\n",
        "  difficulty: str\n",
        "  input_output_type: List[str]\n",
        "  searchable_text: str\n",
        "  passage_text: str\n",
        "  embedding_dim: int\n",
        "  embedding: List[float]"
      ],
      "metadata": {
        "id": "2kQrETTZ78vr"
      },
      "execution_count": 3,
      "outputs": []
    },
    {
      "cell_type": "code",
      "source": [],
      "metadata": {
        "id": "JIRW6ovj8d2M"
      },
      "execution_count": null,
      "outputs": []
    }
  ]
}
