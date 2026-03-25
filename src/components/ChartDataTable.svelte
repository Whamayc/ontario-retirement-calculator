<script>
  let { headers = [], rows = [], caption = '' } = $props()
</script>

<details class="chart-table-toggle">
  <summary>View data table</summary>
  <table>
    {#if caption}
      <caption>{caption}</caption>
    {/if}
    <thead>
      <tr>
        {#each headers as h}
          <th scope="col">{h}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each row as cell}
            <td>{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</details>
