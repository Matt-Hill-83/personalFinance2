-- get blocks with all joins
SELECT
 -- blk.*,
    blk."name" as "block_name",
    sd."numDaysInInterval",
    sjp."seedPaymentId",
    pmt."amount"
    -- pmt.*
    
FROM public."blocks" blk
LEFT JOIN public."seedDatas" sd ON blk."id" = sd."blockId"
LEFT JOIN public."seedDataJoinPayments" sjp ON sd.id = sjp."seedDataId"
LEFT JOIN public."seedPayments" pmt ON pmt.id = sjp."seedPaymentId"